import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

@Component({
  selector: 'app-sklearn-primeiro-modelo',
  standalone: true,
  imports: [RouterLink, PythonConsoleComponent],
  templateUrl: './sklearn-primeiro-modelo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnPrimeiroModeloComponent {

  codeLoadData = `import pandas as pd
from sklearn.datasets import fetch_california_housing

# Carrega o conjunto de dados
housing = fetch_california_housing()

# Para facilitar a visualização, vamos colocá-lo em um DataFrame do Pandas
df = pd.DataFrame(housing.data, columns=housing.feature_names)
df['MedHouseVal'] = housing.target # 'target' é a nossa coluna alvo

print("As 5 primeiras linhas do nosso DataFrame:")
print(df.head())`;

  codeSplitXY = `# X contém todas as colunas, exceto nosso alvo (as 'features')
X = df.drop('MedHouseVal', axis=1)

# y contém apenas a coluna alvo (o 'target')
y = df['MedHouseVal']

print(f"Formato de X (features): {X.shape}")
print(f"Formato de y (target): {y.shape}")`;

  codeTrainTest = `from sklearn.model_selection import train_test_split

# test_size=0.2 significa que 20% dos dados serão para teste
# random_state=42 garante que a divisão seja a mesma toda vez
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Tamanho do conjunto de treino: {X_train.shape[0]} amostras")
print(f"Tamanho do conjunto de teste: {X_test.shape[0]} amostras")`;

  codeTrainModel = `from sklearn.linear_model import LinearRegression

# 1. Cria uma instância do modelo de Regressão Linear
model = LinearRegression()

# 2. Treina o modelo com os dados de treino (fit)
# É aqui que o modelo "aprende" os padrões!
model.fit(X_train, y_train)

print("Modelo treinado com sucesso!")
print("O modelo aprendeu uma 'fórmula' para prever o preço.")`;
  
  codePredict = `# Fazendo previsões nos dados de teste (que o modelo nunca viu)
predictions = model.predict(X_test)

# Vamos criar um DataFrame para comparar as 5 primeiras previsões com os valores reais
df_comparacao = pd.DataFrame({
    'Valor Real': y_test[:5],
    'Previsão do Modelo': predictions[:5]
})

print(df_comparacao.round(2))`;

  // Setup code for subsequent steps
  setupCodeSplitXY = this.codeLoadData;
  setupCodeTrainTest = `${this.codeLoadData}\n${this.codeSplitXY}`;
  setupCodeTrainModel = `${this.setupCodeTrainTest}\n${this.codeTrainTest}`;
  setupCodePredict = `${this.setupCodeTrainModel}\n${this.codeTrainModel}`;
}
