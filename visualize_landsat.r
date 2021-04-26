
library(rgee)
library (raster)
ee_Initialize()

#visualizzare dati landsat su R usando GEE API
landsat <- ee$Image('LANDSAT/LC08/C01/T1_TOA/LC08_044034_20140318')
vizParams <- list(
bands = c('B5', 'B4', 'B3'),
min = 0,
max = 0.5,
gamma = c(0.95, 1.1, 1)

Map$setCenter(lon = -122.1899, lat = 37.5010, zoom = 10) # San Francisco Bay
Map$addLayer(landsat, vizParams, 'false color composite')
