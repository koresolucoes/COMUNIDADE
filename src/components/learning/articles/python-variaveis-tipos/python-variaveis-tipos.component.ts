
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-python-variaveis-tipos',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './python-variaveis-tipos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonVariaveisTiposComponent {
  // --- Type Inspector State ---
  variableName = signal('preco');
  variableValue = signal('25.99');
  
  detectedType = computed(() => {
    const val = this.variableValue().trim();
    
    if (val === 'True' || val === 'False') return 'bool';
    if (/^-?\d+$/.test(val)) return 'int';
    if (/^-?\d*\.\d+$/.test(val)) return 'float';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) return 'str';
    if (val.startsWith('[') && val.endsWith(']')) return 'list';
    if (val.startsWith('{') && val.endsWith('}')) return 'dict';
    
    return 'str (implícito)'; 
  });

  visualRepresentation = computed(() => {
    const type = this.detectedType();
    if (type === 'int' || type === 'float') return '123';
    if (type === 'bool') return 'toggle_on';
    if (type.includes('str')) return 'abc';
    return 'data_object';
  });

  // --- String Lab State (F-Strings) ---
  strName = signal('Maria');
  strRole = signal('Engenheira');
  
  // Shows the python code pattern
  fStringCode = computed(() => {
    return `mensagem = f"Olá, meu nome é {nome} e sou {cargo}."`;
  });

  fStringResult = computed(() => {
    return `Olá, meu nome é ${this.strName()} e sou ${this.strRole()}.`;
  });

  // --- Math/Casting Lab State ---
  valA = signal('10');
  typeA = signal<'int' | 'str'>('int');
  
  valB = signal('5');
  typeB = signal<'int' | 'str'>('int');

  castingResult = computed(() => {
    const a = this.valA();
    const b = this.valB();
    const tA = this.typeA();
    const tB = this.typeB();

    // Simulação da lógica Python
    if (tA === 'int' && tB === 'int') {
      const numA = Number(a);
      const numB = Number(b);
      if (isNaN(numA) || isNaN(numB)) {
         return {
            val: 'ValueError',
            code: `${a} + ${b}`,
            type: 'error',
            desc: 'Erro: Valor não é um número válido'
         };
      }
      return { 
        val: numA + numB, 
        code: `${a} + ${b}`,
        type: 'int',
        desc: 'Soma Matemática'
      };
    }
    
    if (tA === 'str' && tB === 'str') {
      return { 
        val: `"${a}${b}"`, 
        code: `"${a}" + "${b}"`,
        type: 'str',
        desc: 'Concatenação de Texto'
      };
    }

    // Mixed types (Error scenario)
    const codeA = tA === 'str' ? `"${a}"` : a;
    const codeB = tB === 'str' ? `"${b}"` : b;
    return {
      val: 'TypeError',
      code: `${codeA} + ${codeB}`,
      type: 'error',
      desc: 'Erro: Não é possível somar texto com número'
    };
  });
}
