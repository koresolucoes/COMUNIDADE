import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpressionContextService } from '../../../services/n8n/expression-context.service';
import { ExpressionExecutorService } from '../../../services/n8n/expression-executor.service';
import { OperationRegistryService } from '../../../services/n8n/operation-registry.service';
import { Step, StepOperation } from '../../../services/n8n/operations/operation.interface';
import { MethodSuggestionComponent } from './method-suggestion/method-suggestion.component';
import { MethodRegistryService } from '../../../services/n8n/method-registry.service';
import { MethodDefinition } from '../../../services/n8n/methods/method.interface';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-n8n-expression-simulator',
  standalone: true,
  imports: [FormsModule, MethodSuggestionComponent, CodeUsageTipsComponent],
  templateUrl: './n8n-expression-simulator.component.html',
  providers: [ExpressionContextService, ExpressionExecutorService, OperationRegistryService, MethodRegistryService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nExpressionSimulatorComponent {
  isEmbedded = input<boolean>(false);
  
  // --- Injected Services ---
  public contextService = inject(ExpressionContextService);
  private executorService = inject(ExpressionExecutorService);
  private registryService = inject(OperationRegistryService);
  private methodRegistry = inject(MethodRegistryService);

  // --- UI State ---
  public contextTab = signal<'json' | 'node' | 'env'>('json');
  outputTab = signal<'result' | 'expression'>('result');
  mode = signal<'builder' | 'code'>('builder');
  isSuggestionVisible = signal(false);
  suggestionMethods = signal<MethodDefinition[]>([]);

  // --- Builder State (Panel 2 - Builder Mode) ---
  startPoint = signal<'$json' | '$node' | '$env'>('$json');
  steps = signal<Step[]>([]);
  
  // --- Code State (Panel 2 - Code Mode) & Generated Expression ---
  expressionInput = signal('');

  // --- Available Operations ---
  availableOperations = this.registryService.getAvailableOperations();
  stepTypeNames: { [key in StepOperation]: string } = {
    getProperty: 'Pegar Propriedade',
    filter: 'Filtrar Array',
    map: 'Mapear Array',
    reduceSum: 'Somar Array',
    callMethod: 'Chamar Método'
  };

  // --- Snippets for Code Usage Tips ---
  n8nQuickGuideExpression = `{{ $json.body.city }}`;
  n8nQuickGuideIIFE = `{{ (()=>{
  const nome = $json.nome.toUpperCase();
  return \`Olá, \${nome}!\`;
})() }}`;
  pythonSnippet = `import json

# Supondo que 'items' seja a entrada do nó
# items[0].json contém os dados do item anterior
user_name = items[0].json.get('usuario', {}).get('nome', 'Visitante')
capitalized_name = user_name.upper()

# Retorna o resultado para o próximo nó
return [{'json': {'nome_maiusculo': capitalized_name}}]`;
  javascriptSnippet = `// 'items' é um array contendo os dados de entrada
const item = items[0];

const user = item.json.usuario;
const paidOrders = item.json.pedidos.filter(p => p.status === 'pago');
const totalValue = paidOrders.reduce((sum, order) => sum + order.valor, 0);

// Retorna um novo objeto para o próximo nó
item.json.resumo_pedidos = {
  total_pago: totalValue,
  quantidade_paga: paidOrders.length,
  nome_cliente: user.nome
};

return item;`;

  // --- Live Preview Data for each step ---
  stepData = computed(() => {
    const contextValue = this.contextService.context();
    if (contextValue.error || !contextValue.data) return [];
    
    const results: any[] = [];
    let currentData: any = contextValue.data[this.startPoint()];

    for (const step of this.steps()) {
      try {
        const operation = this.registryService.getOperationByType(step.type);
        if (operation) {
          currentData = operation.execute(currentData, step.params);
        } else {
          currentData = undefined; // Operation not found
        }
        results.push(currentData);
      } catch {
        results.push(undefined);
        currentData = undefined;
      }
    }
    return results;
  });

  /** The data resulting from the last step in the pipeline. */
  readonly currentStepData = computed<any>(() => {
    const steps = this.steps();
    const contextValue = this.contextService.context();

    if (contextValue.error || !contextValue.data) {
      return undefined;
    }

    if (steps.length === 0) {
      return contextValue.data[this.startPoint()];
    }
    
    const allStepData = this.stepData();
    return allStepData[allStepData.length - 1];
  });

  // --- Computed properties for enabling/disabling UI buttons ---
  public readonly isArrayOperationsEnabled = computed(() => Array.isArray(this.currentStepData()));
  public readonly isGetPropertyEnabled = computed(() => {
    const data = this.currentStepData();
    return typeof data === 'object' && data !== null;
  });


  // --- Expression Generation ---
  generatedExpression = computed(() => {
    const context = this.contextService.context();
    if (context.error || !context.data) {
      return '{{ /* Erro no JSON de entrada */ }}';
    }
    
    let code: string = this.startPoint();
    let previousData: any = context.data[this.startPoint()];

    for (const step of this.steps()) {
        const operation = this.registryService.getOperationByType(step.type);
        if(operation) {
          code = operation.generateCode(code, step.params, previousData);
          try {
            previousData = operation.execute(previousData, step.params);
          } catch {
            previousData = undefined;
          }
        }
    }
    return `{{ ${code} }}`;
  });

  // --- Final Output Calculation ---
  finalResult = computed(() => {
    const expression = this.expressionInput().trim();
    const contextValue = this.contextService.context();

    if (contextValue.error) {
        return { value: contextValue.error, isError: true };
    }
    if (!expression) {
        return null;
    }
    
    const executionResult = this.executorService.execute(expression, contextValue.data!);
    const value = typeof executionResult.value === 'undefined' ? 'undefined' 
                : JSON.stringify(executionResult.value, null, 2);

    return { ...executionResult, value };
  });


  constructor() {
    // Sync builder output with code input when in builder mode
    effect(() => {
        if (this.mode() === 'builder') {
            this.expressionInput.set(this.generatedExpression());
        }
    });
  }

  // --- Methods for Builder UI ---
  setStartPoint(point: '$json' | '$node' | '$env') {
    this.startPoint.set(point);
    this.steps.set([]); // Reset steps when changing the starting point
  }

  addStep(type: StepOperation, params?: any) {
    const operation = this.registryService.getOperationByType(type);
    if (!operation) return;
    
    this.steps.update(s => [...s, { 
      id: Date.now().toString(), 
      type, 
      params: params || operation.defaultParams 
    }]);
  }

  removeStep(id: string) {
    this.steps.update(s => s.filter(step => step.id !== id));
  }

  updateStepParam(id: string, param: string, value: any) {
    this.steps.update(s => s.map(step => 
      step.id === id ? { ...step, params: { ...step.params, [param]: value } } : step
    ));
  }
  
  getStepProperties(index: number): string[] {
    const data = index === 0 
      ? this.contextService.context().data?.[this.startPoint()] 
      : this.stepData()[index - 1];
      
    if (!data) return [];
    
    const sample = Array.isArray(data) ? data[0] : data;
    
    if (typeof sample === 'object' && sample !== null) {
      return Object.keys(sample);
    }
    
    return [];
  }

  openSuggestionModal() {
    const methods = this.methodRegistry.getMethodsForValue(this.currentStepData());
    this.suggestionMethods.set(methods);
    this.isSuggestionVisible.set(true);
  }

  onMethodSelected(method: MethodDefinition) {
    this.addStep('callMethod', { methodName: method.name });
    this.isSuggestionVisible.set(false);
  }

  formatInput(tab: 'json' | 'node' | 'env') {
    const service = this.contextService;
    let signalToUpdate;

    switch (tab) {
      case 'json':
        signalToUpdate = service.jsonInput;
        break;
      case 'node':
        signalToUpdate = service.nodeInput;
        break;
      case 'env':
        signalToUpdate = service.envInput;
        break;
    }

    try {
      const currentContent = signalToUpdate();
      if (currentContent.trim() === '') return;
      const parsed = JSON.parse(currentContent);
      signalToUpdate.set(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Ignore formatting errors, the validation will catch it.
    }
  }
}
