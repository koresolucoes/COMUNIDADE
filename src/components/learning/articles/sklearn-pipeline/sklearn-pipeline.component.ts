
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

@Component({
  selector: 'app-sklearn-pipeline',
  standalone: true,
  imports: [RouterLink, PythonConsoleComponent],
  templateUrl: './sklearn-pipeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnPipelineComponent {

  pipelineCode = `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# 1. Dados de exemplo
data = {
    'quartos': [3, 4, 2, 5, 3, 4],
    'regiao': ['Norte', 'Sul', 'Norte', 'Leste', 'Sul', 'Norte'],
    'preco': [300, 450, 250, 500, 420, 310]
}
df = pd.DataFrame(data)

X = df.drop('preco', axis=1)
y = df['preco']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

# 2. Definir os transformadores para cada tipo de coluna
numeric_features = ['quartos']
categorical_features = ['regiao']

# O ColumnTransformer aplica o scaler nas colunas numéricas e o encoder nas categóricas
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])

# 3. Criar o Pipeline
# Ele primeiro executa o pré-processador e depois treina o modelo de regressão
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

# 4. Treinar o Pipeline inteiro com um único comando .fit()!
pipeline.fit(X_train, y_train)
print("Pipeline treinado com sucesso!")

# 5. Fazer previsões
predictions = pipeline.predict(X_test)
print("\\nPrevisões vs. Valores Reais:")
for real, pred in zip(y_test, predictions):
    print(f"  Real: {real}, Previsto: {pred:.2f}")

# 6. Avaliar
mse = mean_squared_error(y_test, predictions)
print(f"\\nMSE do Pipeline: {mse:.2f}")`;
}
