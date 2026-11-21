# Estimación de NO2 para la calidad del aire de la CDMX 
 ## Contexto del proyecto
 En este proyecto, abordamos una de las problemáticas más frecuentes en recolección de datos para la clasificación de la calidad del aire en México: la estimación de valores faltantes en los
 datasets gubernamentales. Para ello, utilizamos los datos de
[Mexico Hourly Air Pollution (2010-2021)](https://www.kaggle.com/datasets/elianaj/mexico-air-quality-dataset/data?select=stations_rsinaica.csv)

## Resumen de la toma de decisiones
* Elección del dataset: Después de revisar la documentación y la página oficial del Sistema Nacional de Información de la Calidad del Aire (SINAICA) se decidió trabajar con los archivos:
  stations_daily.csv y stations_rsinaica.csv.
* Exploración de los datos: Realizamos una unión de las columnas station_id, station_name y network_name entre stations_daily.csv y stations_rsinaica.csv. Con el objetivo de obtener solo
  los datos correspondientes a la Ciudad de México. 
* Modelo 1: Decidimos estimar la columna NO2 mediante un modelo de Regresión Lineal Múltiple con las columnas de O3, CO y PM2.5.
   - Variables: Se realizo una matriz de correlación para decidir que datos usaríamos para el modelo de regresión.
* Modelo 2:
* Modelo 3:
* Imputación:
  - Atípicos: Se analizo la existencia de atípicos mediante diagramas de caja y bigotes. Al notar que existían más atípicos de los esperados, se consulto bibliografía para
    encontrar la mejor estrategia de manipulación.
  - Nulos: Los datos nulos encontrados, se imputaron mediante "medianas por grupos". Es decir, se agruparon los datos por estaciones del año (primavera, verano, otoño e invierno).
    Posteriormente, se calcularon la mediana de cada grupo de estaciones y los nulos que pertenecían a X estación se reemplazaron por las mediana de la estación X. 
* Visualización e interacción con el modelo: Se realizo un página web donde el usuario puede interactuar con la interfaz para calcular la estimación del NO2. 
## Stack tecnológico 
* Lenguajes de programación: TypeScript y Phyton 
* Frameworks: Next.js
* Entornos: Jupyter Notebook
* Plataformas de despliegue: Vercel y Render 
