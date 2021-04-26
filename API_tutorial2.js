//--------IMAGE COLLECTION------------------------------------------------------------------------------------------------------

//inserisco una collezione di imamgini
//importo i dati landsat8 OLI, Toa = top-of-atmosphere (TOA) reflectance
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA');

//aggiungo una variabile filtro spaziale
var filtroSpaziale = l8.filterBounds (point);
//aggiungo una variabile filtro temporale (applicata sull'immagine filtrata sul point)
var filtroTemporale = filtroSpaziale.filterDate ('2017-06-17', '2017-07-17');

print (filtroTemporale)

  
//AGGIUNGO UN'IMMAGINE ALLA MAPPA
  
// carico il dataset L8 toa filtrato per il punto e per data: ad es l'estate del 2017
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2017-06-01', '2017-09-01')
print(l8)

//gli dico di prendere tra le proprietà il cloud cover
var sorted = l8.sort('CLOUD_COVER')
print (sorted, 'sorted by cloud')

//e di scegliere l'immagine meno nuvolosa
var l8_sorted = sorted.first ()
print (l8_sorted, "immagine meno nuvolosa dell'estate 2017")

/*definisco i PARAMTRI DI VISUALIZZAZIONE - meglio creare una variabile apposta così posso riutilizzarla
le bande sono float: se non inserisco i parametri min e max 
di default lo stretching applicato sarà da 0 a 1
Devo specificare le bande altrimenti di defult vengono inserite nei tre canali RGB le
prime tre bande*/
var visParams_trueColour = {bands: ['B4','B3','B2' ], min:0, max:0.3}
var visParams_infraRed = {bands: ['B5','B4','B3' ], min:0, max:0.3}
var visParams_654 = {bands: ['B6','B5','B4' ], min:0, max:0.3}
var visParams_764 = {bands: ['B7','B6','B4' ], min:0, max:0.3}
var visParams_753 = {bands: ['B7','B5','B3' ], min:0, max:0.3}


//inserisco le immagini
Map.addLayer (l8_sorted,visParams_trueColour, 'L8 2017 true colour',1)
Map.addLayer (l8_sorted,visParams_infraRed, 'L8 2017 infra red',1)
Map.addLayer (l8_sorted,visParams_654, 'L8 2017 654',1)
Map.addLayer (l8_sorted,visParams_764, 'L8 2017 764',1)
Map.addLayer (l8_sorted,visParams_753, 'L8 2017 753',1)

//con centerObject non devo inserire lat e long ma una geometria o l'immagine stessa 
Map.centerObject (l8_sorted, 10)

  
//AGGIUNGO UNA COLLEZIONE DI IMMAGINI ALLA MAPPA

//// carico il dataset L8 toa filtrato per il punto e per data: ad es l'estate del 2017
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2017-06-01', '2017-09-01')//.mosaic (se lo aggiungo le diverse immagini vengono composte in un'unica immagine - prende i valori più recenti x ogni pixel)
print(l8)

var visParams_trueColour = {bands: ['B4','B3','B2' ], min:0, max:0.3}
var visParams_infraRed = {bands: ['B5','B4','B3' ], min:0, max:0.3}

//inserisco le immagini
Map.addLayer (l8,visParams_trueColour, 'L8 2017 true colour',1)
Map.addLayer (l8,visParams_infraRed, 'L8 2017 infra red',1)

//con centerObject non devo inserire lat e long ma una geometria o l'immagine stessa 
Map.centerObject (l8, 10)
  
//quando carico un dataset vengono visualizzati i pixel più recenti. per questo vedo una discontinuità tra le immagini

//COMPOSIT CON MEDIAN REDUCER
// carico il dataset L8 toa filtrato per il punto e per data: ad es l'estate del 2017
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2017-06-01', '2017-09-01').median()
print(l8)

/*con.median (dopo la data sempre!!!)invece di prendere l'ultimo pixel disponibile gee 
prende un valore medio nel tempo per ogni pixel. questo ha l'effetto di rimuovere
le nuvole, che hanno un valore alto,
e le ombre, che hanno un valore basso*/

var visParams_trueColour = {bands: ['B4','B3','B2' ], min:0, max:0.3}
var visParams_infraRed = {bands: ['B5','B4','B3' ], min:0, max:0.3}
Map.addLayer (l8,visParams_trueColour, 'median true colour',1)
Map.addLayer (l8,visParams_infraRed, 'median infra red',0)
Map.centerObject (point, 10)
  
  
  
//MASKING
  
//voglio caricare una maschera per l'acqua --> uso .select, .eq e .updateMask
//carico il dataset global forest change. 
var hansen = ee.Image("UMD/hansen/global_forest_change_2015")
print(hansen)

//la banda datamask ha 2= acqua e 1=land o Nan
var water = hansen.select('datamask')

/*equal da come risultato 1 se il primo valore (quello in water)
è uguale al secondo (l'argometno tra parentesi, 1). tutto il resto viene messo a 0. in questo caso land = 1, water = 0*/
var mask = water.eq(1)

/*con updateMask la maschera (che è l'argomento tra parentesi)
viene applicata all'immagine (water). la maschera deve avere valori che vanno
da 0 a 1 e viene applicata a tutte le bande (in questo caso solo una)
Tutti i pixel che nella immagine/maschera hanno valore 0 diventano trasparenti, NODATA, nella prima immagine*/
var masked = water.updateMask(mask)

print (masked, 'masked image')
Map.addLayer (masked, {palette: ['green']},'masked',1)
Map.centerObject (point, 4)
  
  
//MOSAIC
  
//voglio un'immagine true color nella terra e con valori blu nel mare
//carico i due dataset
var hansenImage = ee.Image('UMD/hansen/global_forest_change_2015');
var l8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA")
  .filterBounds(roi)
var median = l8.filterDate('2017-06-01', '2018-06-01').median();

//stabilisco i paramtri di visualizzazione a colori naturali
var visParams = {bands: ['B4', 'B3', 'B2'], max: 0.3};

//creo un'immagine mascherata in cui: acqua = 0,  land=1
var hansen = hansenImage.select('datamask');
var mask = hansen.eq(1);
var maskedWater = hansen.updateMask(mask);

/*uso .not per invertire tutti i valori. questa funzione ritorna un'immagine
con valori 0 nei valori 1 della prima immagine e vicevera*/
var water1_land0 = mask.not()
/*water è un'immagine in cui l'acqua ha valore 1 e la terra ha valore 0.
Per impostare land = nodata applico all'acqua la maschera di se stessa*/
var water1_landNO = water1_land0.mask(water1_land0)


//visualizzo tutte le immagini nella mappa
//mask ha water= 0 (white), land=1 (green)
Map.addLayer(mask, {palette: ['white','green']}, 'mask',0)
//water1_land0 ha land = 0 (white), water = 1 (blue)
Map.addLayer (water1_land0, {palette: ['white','blue']}, 'water1_land0',0)
//water1_landNO ha water=1 (blue), land= MASCHERATO
Map.addLayer (water1_landNO, {palette: ['white','blue']}, 'water1_landNO',0)
//l8 median e centro la mappa
Map.addLayer (median, visParams, 'L8 median',0)
Map.centerObject(roi,7)

//uso mosaic per comporre le due immagini, ma mosaic funziona solo con collezioni di imamgini!
/*ee.ImageCollection costruisce una collezione di immagini - qui le immagini
le inserisco con .visualize - questo trasforma le immagini in immagini a 3 bande, 8bit 
e in relazione ai parametri di visualizzazione impostati */
var mosaic = ee.ImageCollection ([
  median.visualize(visParams),
  water1_landNO.visualize ({palette:'blue'}),
]).mosaic()

Map.addLayer(mosaic, {}, 'custom mosaic', 0);


//-----NDVI---------------------------------------------------------------------------------------------------------------------

// inserico la geometria (vettore) con le coordinate long e lat
var point = ee.Geometry.Point (95, 45)

//carico il dataset filtrato per la geometria, la data, e seleziono l'immagine con valore di cloud cover più basso
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2018-06-01','2018-09-01')
  .sort('CLOUD_COVER')
  .first()
print(l8)

//definisco la variabile vicino infrarosso
var nir = l8.select ('B5')
//definisco la variabile rosso
var red = l8.select ('B4')
//ndvi = nir-red/(nir+red)
var ndvi = nir.subtract(red).divide(nir.add(red))
print(ndvi, 'ndvi')

//sii può anche applicare la funzione di gee
var ndvi_shortcut = l8.normalizedDifference('B5','B4').rename ('ndvi_shortcut')


Map.setCenter (95, 45, 6)
Map.addLayer (ndvi, {min:-1, max:1, palette:['white','green']}, 'ndvi')
Map.addLayer (ndvi_shortcut, {min:-1, max:1, palette:['white','green']}, 'ndvi')

  
  
---------------------------------------------------------------------------------------------------------------


//voglio inserire la banda ndvi in ogni immagine di una collezione
// inserico la geometria (vettore) con le coordinate long e lat
var point = ee.Geometry.Point (95, 45)

//carico il dataset filtrato per la geometria, la data
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2018-06-01','2018-06-30')

print(l8)

//creare una funzione che calcola l'ndvi e ritorna image+ndvi
var funzione = function(image){
  var ndvi = image.normalizedDifference(['B5','B4']).rename('ndvi');
  return image.addBands(ndvi)
}

//applico questa funzione ad ogni immagine del dataset l8 con la funzione map
var bandNDVI = l8.map(funzione)
print(bandNDVI)

//mostro nella mappa le immagini + ndvi
Map.addLayer (bandNDVI, {min:0, max:0.3, bands: ['B5', 'B4', 'ndvi']}, 'new image', true)
Map.setCenter (95, 45, 6)
  
/*uso la funzione qualityMosaic per creare un'immagine composta in cui ogni pixel
ha il massimo valore di NDVI*/
var greenest = bandNDVI.qualityMosaic('ndvi')

//questo per scegliere immagini dello stesso periodo e ridurre la disconinuità
Map.addLayer (bandNDVI, {min:0, max:0.3, bands: ['B4', 'B3', 'B2']}, 'quality mosaic', true)
Map.addLayer (l8, {min:0, max:0.3, bands: ['B4', 'B3', 'B2']}, 'mosaic', true)

  
  
  
  
//-------------GRAFICO-------------------------------------------------------------------------------------------------------------------

  
//creo un grafico con il valore di NDVI nel tempo
//inserisco il punto di interesse 
var point = ee.Geometry.Point (12,46)
//carico il dataset filtrato per la geometria, la data
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
  .filterBounds (point)
  .filterDate ('2018-01-01','2018-12-31')

print(l8)

//creare una funzione che calcola l'ndvi e ritorna image+ndvi
//applico questa funzione ad ogni immagine del dataset l8 con la funzione map
var withNDVI = l8.map (function(image){
  var ndvi = image.normalizedDifference(['B5','B4']).rename('ndvi');
  return image.addBands(ndvi)
});

print(withNDVI)

//mostro nella mappa le immagini + ndvi
Map.addLayer (withNDVI, {min:-1, max:1, bands: ['ndvi'], palette: ['blue','yellow','green']}, 'withNDVI', true)
Map.centerObject (point, 6)

//creo un grafico con ui.Chart per vedere com'è cambiato l'Ndvi durante l'anno 2018
var grafico = ui.Chart.image.series ({
  imageCollection: withNDVI.select('ndvi'),
  region: point,
  reducer: ee.Reducer.first (),
  scale:30
}). setOptions ({title: 'ndvi over time'})

print(grafico)
//il grafico può essere scaricato in CSV oppure PNG


  
//-------------------CLOUD MASK landsat-------------------------------------------------------------------------------------------

//creo una funzione per filtrare le immagini Landsat e ottenere un NDVI e un grafico NDVI più pulito
//seleziono il punto
var point = ee.Geometry.Point([30, -3]);

//carico il dataset
var l8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA")
  .filterBounds(point)
  .filterDate ('2020-01-01','2020-12-31')
print(l8);

//lo aggiungo subito alla mappa
Map.addLayer (l8, {min:0,max:0.3, bands: ['B4','B3','B2']}, 'true colour',1);
Map.centerObject (point, 8)

//applico una funzione alla collezione l8 (uso map per applicarla ad ogni immagine)
var cloudLessNDVI = l8.map(function(image){
  /*questo algoritmo prende l'immagine landsat TOA e aggiunge una banda (colud) 
  che è un indice di nuvolosità da 0 a 100*/
  var cloud = ee.Algorithms.Landsat.simpleCloudScore (image).select('cloud');
  //creo una maschera per le immagini con cloud>20
  var mask =cloud.lte(20)
  //calcola l'ndvi tra le bande di (image) e rinomina la banda
  var ndvi = image.normalizedDifference(['B5','B4']).rename('ndvi');
  //aggiunge la banda ndvi e applica la maschera
  return image.addBands(ndvi).updateMask (mask);
}); 


//imposto i paramtri di visualizzazione per la banda ndvi
var visParam = {min:-1, max:1, bands: 'ndvi', palette: ['green','pink']};
//carico il layer con ndvi nella mappa
Map.addLayer (cloudLessNDVI, visParam, 'with_cloudlessNDVI', 1)


//creo il grafico per questo NDVI
var grafico = ui.Chart.image.series ({
  imageCollection: cloudLessNDVI.select ('ndvi'),
  region: point,
  reducer: ee.Reducer.first(),
  scale: 30,
}).setOptions ({title: 'masked NDVI nel 2020'});

print(grafico);

  
  
//--------------------EXPORT-------------------------------------------------------------------------------------------------------------

Export.image.toDrive({
  image: l8,
  description: 'Landsat 8 2020',
  scale: 30
});


//--------------DEFERRED EXECUTIONS--------------------------------------------------------------------------------------------------------------

//quando si scrive un codice in gge questo viene "codificato" in un JSON object e poi è spedito al server
//la "spedione" e il calcolo non viene eseguito finché non è spplicitamente richiesto ad es con pint() o Map.addLayer()
var image = ee.Image('CGIAR/SRTM90_V4');
//con questo ordine viene creato il JSON object
var operation = image.add(10);
print (operation); //---l'ordine è inviato al server attraverso ii JSON object. per vedere il JSON di risposta di può selezionare JSON nella console oppure:
print (operation.toString());

//-------------------SCALE--------------------------------------------------------------------------------------------------------------------------

/*scale= pixel resolution. la scala viene specificata nell'output e il risultato viene mostrato coerentemente con questa scala
al contrario di quello che avviene in GIS in cui la risoluzione è determinata dall'input.
Le immagini su gee esistono a diverse scale (secondo una logica piramidale), in cui il livello più basso rappresenta l'immagine alla sua risoluzione
originaria - salendo i dati vengono aggregati finché l'immagine non raggiunge la dimensione di 256x256 pixel.
per immagini con valori continui l'aggregazione viene fatta con la media dei pixel nell'immagine più bassa nella piramide;
per immagini con valori discreti l'aggregazione viene fatta con campioni di pixel a livello più basso (di default nearest neighbor)
Quando si aggiunge un layer alla mappa il livello di zoom impostato determina la scala a cui è richiesa l'immagine di input*/

//aggiungo un'immagine in banda 4 di Landsat 
var image = ee.Image('LANDSAT/LC08/C01/T1/LC08_044034_20140318').select('B4');
print (image)
Map.centerObject (image)

//creo una funzione che mi permette di stampare ad una (scala:argomento della funzione)
var printAtScale = function (scale) {
  print ('pixel resolution:'+scale+'m',
  //applico un riduttore all'immagine landsat
  image.reduceRegion ({
    //gli argomenti del riduttore sono il riduttore da applicare
    reducer: ee.Reducer.first (),
    //questo riduttore da come risultato il primo input
    //la geometria: il centro dell'immagine
    geometry: image.geometry().centroid(),
    //la scala
    scale: scale
  }).get ('B4'));
}

//con scala 10m il pixel centrale nell'immagine ha questo valore:
printAtScale (10)
//con scala 20m...
printAtScale (20)
printAtScale (30)
printAtScale (40)
printAtScale (50)
/*non è detto che i valori rimangano uguali, perchè per ogni scala è selezionato un diverso 
livello della piramide. per scale simili l'applicazione dell'algoritmo nearest neighbor
fa si che i pixel abbiano valori uguali*/
  
//i diversi livelli delle immagini sono anche riproiettati  (maps mercator (EPSG:3857)) prima di essere visualizzati


//------------------PROIEZIONI-----------------------------------------------------------------------------------------------------------------------

/*gee utilizza il datum geodetico WGS84 (basato sull'ellissoide WGS84)
è un sistema proiettato (coordinate X e Y espresse in metri) pseudo -mercatore
EPSG: 3857.
Come per la scala, anche la proiezione è definita dall'output. Es modis ha una proiezione
sinusuoidale - quando lo chiamo in gee l'input viene richiesto nella proiezione di pseudo-merc*/

var modis = ee.Image('MODIS/006/MOD13A1/2014_05_09').select(0);
print (modis)
var visParams = {min:0.15, max:0.7};
var rescaled = modis.unitScale(-2000, 10000);
Map.addLayer (modis, visParams, 'FireMask',1 );
Map.centerObject (modis, 8)



//si può controllare la proiezione di un'immagine con projection
var image = ee.Image('LANDSAT/LC08/C01/T1/LC08_044034_20140318').select(0);
//stampo la proiezione
print('Projection, crs, and crs_transform:', image.projection());
//con nominal scale vedo la risoluzione originaria dell'immagine (l'immagine più bassa della piramide)
print('Scale in meters:', image.projection().nominalScale());
/*visto che le bande di un'immagine possono avere proiezione diversa,
chiamando projection() su più bande si può avere un errore*/
var image = ee.Image('LANDSAT/LC08/C01/T1/LC08_044034_20140318');
print('Projection, crs, and crs_transform:', image.projection()) //--errore


/*di solito non c'è bisogno di specificare la proiezione.
in alcuni casi invece la proiezione di un output può essere ambigua, ad esempio
quando si mosaica una image collection con immagini con diverse proiezioni*/

/*si può forzare gee ad eseguire il risultato in una certa proiezione con
reproject () */
var proj = ee.Projection(...qualche proiezione);
var output = collection.reduce(...qualche proiezione).reproject(proj);


