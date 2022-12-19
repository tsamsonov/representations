function _1(md){return(
md`# Point to polygon interpolation on a map`
)}

function _2(Plot,rayons,midpolygons,oblasts){return(
Plot.plot({
  color: {
    type: "linear",
    n: 8,
    domain: [0, 40],
    scheme: "greens",
    label: "Wheat yield (mln ton)",
    legend: true
  },
  marks: [
    Plot.geo(rayons, { stroke: 'black'}),
    Plot.geo(midpolygons, { stroke: 'black', fill: d => d.properties.Yield }),
    Plot.geo(oblasts, { stroke: 'black', strokeWidth: 2}),
    Plot.graticule()
  ],
  projection: {
    type: "mercator",
    domain: rayons,
    inset: 20
  }         
})
)}

function _repres(Inputs){return(
Inputs.radio(["Regions", "Dots"], {label: "Representation", value: "Regions"})
)}

function _ratio(Inputs){return(
Inputs.range([0, 100], {label: "Interpolate", step: 1})
)}

function _5(Plot,combinepolygons,aggratio,oblasts,zoom_domain){return(
Plot.plot({
  color: {
    type: "linear",
    domain: [0, 40],
    n: 8,
    scheme: "greens",
    label: "Wheat yield (mln ton)",
    legend: true
  },
  marks: [
    Plot.geo(combinepolygons, { stroke: 'black', strokeOpacity: 1-aggratio/100, fill: d => d.properties.Yield }),
    Plot.geo(oblasts, { stroke: 'black', strokeWidth: 2}),
    Plot.graticule()
  ],
  projection: {
    type: "mercator",
    domain: zoom_domain,
    inset: 20
  }         
})
)}

function _aggr(Inputs){return(
Inputs.radio(["No", "Yes"], {label: "Aggregation", value: "No"})
)}

function _aggratio(Inputs){return(
Inputs.range([0, 100], {label: "Aggregate", step: 1})
)}

function _power(Inputs){return(
Inputs.range([1, 100], {label: "Power", step: 1})
)}

function _pow(power){return(
power / 100
)}

function _10(repres,set,$0)
{
  repres;
  let timeout = 0;
  let speed = 3
  if (repres == "Regions") {
    var i = 100;
    setTimeout(function run() {
      if (i > 0){
        i-=speed;
        set($0, i)
      }
      setTimeout(run, timeout)
    }, timeout)
  } else {
    var i = 0;
    setTimeout(function run() {
      if (i < 100) {
        i+=speed;
        set($0, i)
      }
      setTimeout(run, timeout)
    }, timeout) 
  }
  return repres
}


function _11(aggr,set,$0)
{
  aggr;
  let timeout = 0;
  let speed = 3
  if (aggr == "No") {
    var i = 100;
    setTimeout(function run() {
      if (i > 0){
        i-=speed;
        set($0, i)
      }
      setTimeout(run, timeout)
    }, timeout)
  } else {
    var i = 0;
    setTimeout(function run() {
      if (i < 100) {
        i+=speed;
        set($0, i)
      }
      setTimeout(run, timeout)
    }, timeout) 
  }
  return aggr
}


function _zoom_domain(turf,rayons,aggratio)
{
  var box = turf.bbox(rayons);
  var mid = [(box[2] + box[0]) / 2, (box[3] + box[1]) / 2]

  var southwest = [
    mid[0] + (box[0]-mid[0]) * (aggratio/100 + 1),
    mid[1] + (box[1]-mid[1]) * (aggratio/100 + 1) 
  ];

  var northeast = [
    mid[0] + (box[2]-mid[0]) * (aggratio/100 + 1),
    mid[1] + (box[3]-mid[1]) * (aggratio/100 + 1) 
  ];
  
  return turf.lineString([southwest, northeast]);
}


function _proj(){return(
import("https://cdn.skypack.dev/proj4")
)}

function _turf(require){return(
require("@turf/turf@6")
)}

function _flubber(require){return(
require('https://unpkg.com/flubber')
)}

function _rayons(FileAttachment){return(
FileAttachment("yield_ms@1.geojson").json()
)}

function _oblasts(FileAttachment){return(
FileAttachment("yield_diss.geojson").json()
)}

function _centers(apply,rayons,turf){return(
apply(rayons, turf.centroid)
)}

function _circles(apply,centers,turf){return(
apply(centers, turf.buffer, 10)
)}

function _voronoys(turf,oblasts,centers,apply_all,apply){return(
turf.featureCollection(oblasts.features.map(obl => {
  var obl_centers = centers.features.filter(rayon => rayon.properties.OKATO_ADM1 == obl.properties.OKATO_ADM1);
  var raw_voronoys = apply_all(turf.featureCollection(obl_centers), 
                               turf.voronoi, { bbox: turf.bbox(obl) })
  return apply(raw_voronoys, turf.intersect, obl).features;
}).flat())
)}

function _circle_coords(circles){return(
circles.features.map(f => f.geometry.coordinates[0])
)}

function _rayons_coords(rayons){return(
rayons.features.map(feature => feature.geometry.coordinates[0])
)}

function _voronoys_coords(voronoys){return(
voronoys.features.map(feature => {
  return feature.geometry.type == 'Polygon' ? feature.geometry.coordinates[0] : feature.geometry.coordinates[0][0]
})
)}

function _project_polygons(structuredClone,proj){return(
function project_polygons(layer, from, to){ 
  let new_layer = structuredClone(layer);
  for (let feature of new_layer.features)
    for (let polygon of feature.geometry.coordinates)
      for (let ring of polygon)
        for (let i in ring) {
          let new_coord = proj.default(from, to, ring[i])
          ring[i] = new_coord;
        }
  return new_layer;
}
)}

function _apply(structuredClone,turf){return(
function apply(layer, fun, ...args) {
  let new_layer = structuredClone(layer);
  for (let i in new_layer.features) {
    var geom = fun(new_layer.features[i], ...args).geometry
    new_layer.features[i].geometry = turf.booleanClockwise(geom) ? geom : turf.rewind(geom, { reverse: true })
  }
  return new_layer;
}
)}

function _apply_all(structuredClone){return(
function apply_all(layer, fun, ...args) {
  let new_layer = fun(layer, ...args);
  for (let i in new_layer.features) {
    new_layer.features[i].properties = structuredClone(layer.features[i].properties)
  }
  return new_layer;
}
)}

function _set(Event){return(
function set(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", {bubbles: true}));
}
)}

function _interps(flubber,rayons_coords,circle_coords){return(
flubber.interpolateAll(rayons_coords, circle_coords, {maxSegmentLength: 2, string: false})
)}

function _midshape(interps,ratio,structuredClone,turf){return(
interps.map(interp => {
  var mid = interp(ratio/100);
  if (mid[0][0] != mid[mid.length-1][0] || mid[0][1] != mid[mid.length-1][1])
    mid.push(structuredClone(mid[0]))

  return turf.booleanClockwise(mid) ? mid : mid.reverse()
})
)}

function _midpolygons(midshape,turf,rayons){return(
midshape.map((coords, i) => turf.polygon([coords], { Yield: rayons.features[i].properties.Yield,  OKATO_ADM1: rayons.features[i].properties.OKATO_ADM1}))
)}

function _oblast_coords(oblasts)
{
  var coords = {}
  oblasts.features.forEach(feature => coords[feature.properties.OKATO_ADM1] = feature.geometry.coordinates[0][0])
  return coords;
}


function _rayons_coords_obl(oblasts,rayons)
{
  var coords = {}
  oblasts.features.forEach(oblast => coords[oblast.properties.OKATO_ADM1] = rayons.features.filter(rayon => rayon.properties.OKATO_ADM1 == oblast.properties.OKATO_ADM1).map(rayon => rayon.geometry.coordinates[0]))
  return coords;
}


function _circles_coords_obl(oblasts,circles)
{
  var coords = {}
  oblasts.features.forEach(oblast => {
    coords[oblast.properties.OKATO_ADM1] = {}
    circles.features.filter(circle => circle.properties.OKATO_ADM1 == oblast.properties.OKATO_ADM1).forEach(circle => coords[oblast.properties.OKATO_ADM1][circle.properties.OBJECTID] =  circle.geometry.coordinates[0])
  })
  return coords;
}


function _voronoys_coords_obl(oblasts,voronoys)
{
  var coords = {}
  oblasts.features.forEach(oblast => {
    coords[oblast.properties.OKATO_ADM1] = {}
    var voronoys_obl = voronoys.features.filter(vor => 
        vor.properties.OKATO_ADM1 == oblast.properties.OKATO_ADM1);
    
    voronoys_obl.forEach(vor => {
      coords[oblast.properties.OKATO_ADM1][vor.properties.OBJECTID] = vor.geometry.type == 'Polygon' ? vor.geometry.coordinates[0] : vor.geometry.coordinates[0][0]
    })
  })
  return coords;
}


function _mean_obl(oblasts,centers)
{
  var mean_obl = {}
  oblasts.features.forEach(oblast => {
    var okato = oblast.properties.OKATO_ADM1;
    var centers_obl = centers.features.filter(circle => circle.properties.OKATO_ADM1 == okato)
    var sum = centers_obl.map(center => center.properties.Yield).reduce((a, b) => a + b, 0);

    mean_obl[okato] = sum / centers_obl.length
  })
  return mean_obl;
}


function _combinecircles(oblast_coords,flubber,circles_coords_obl,voronoys_coords_obl)
{
  var comp = {};
  Object.keys(oblast_coords).forEach(okato => 
    comp[okato] = flubber.interpolateAll(
      Object.values(circles_coords_obl[okato]), 
      Object.values(voronoys_coords_obl[okato]), 
      { maxSegmentLength: 2, string: false }
    )
  );
  return comp
}


function _combineshape(combinecircles,circles_coords_obl,aggratio,structuredClone,turf)
{
  var res = {};
  Object.keys(combinecircles).forEach(okato => {
    res[okato] = {}
    var ids = Object.keys(circles_coords_obl[okato]);
    combinecircles[okato].forEach((interp, i) => {
      var mid = interp(aggratio/100);
      if (mid[0][0] != mid[mid.length-1][0] || mid[0][1] != mid[mid.length-1][1])
        mid.push(structuredClone(mid[0]))
      res[okato][ids[i]] = turf.booleanClockwise(mid) ? mid : mid.reverse()
    })
  })
  return res;
}


function _combinepolygons(combineshape,rayons,turf,pow,aggratio,mean_obl){return(
Object.keys(combineshape).map(okato => {
  var polygons = [];
  Object.keys(combineshape[okato]).forEach(id => {
    var value =  rayons.features.filter(f => f.properties.OBJECTID == id)[0].properties.Yield
    polygons.push(
      turf.polygon([combineshape[okato][id]], { 
        Yield: ((100 ** pow - aggratio ** pow) * value + 
                (aggratio ** pow) * mean_obl[okato]) / 100 ** pow,  
        OKATO_ADM1: okato
      })
    )
  })

  return polygons;
}).flat()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["yield_diss.geojson", {url: new URL("./files/cc2fa1607e0cc317f333315be2db55a7c096423c2b15d25f5a1acff166f877ba90ae5bfe10107fa8e152c823d365a65ad8cf6fade2a6885bccd8bb752b6dcda0.geojson", import.meta.url), mimeType: "application/geo+json", toString}],
    ["yield_ms@1.geojson", {url: new URL("./files/8491f0ee32e1f7dbd41a4fe9fa472bbcd63b4706290d9685e7aaa43fa403fd07c8bbb674af725566336406fa4be9c47064bee0759e23a5ccc390939b3baf3e5b.geojson", import.meta.url), mimeType: "application/geo+json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["Plot","rayons","midpolygons","oblasts"], _2);
  main.variable(observer("viewof repres")).define("viewof repres", ["Inputs"], _repres);
  main.variable(observer("repres")).define("repres", ["Generators", "viewof repres"], (G, _) => G.input(_));
  main.variable(observer("viewof ratio")).define("viewof ratio", ["Inputs"], _ratio);
  main.variable(observer("ratio")).define("ratio", ["Generators", "viewof ratio"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","combinepolygons","aggratio","oblasts","zoom_domain"], _5);
  main.variable(observer("viewof aggr")).define("viewof aggr", ["Inputs"], _aggr);
  main.variable(observer("aggr")).define("aggr", ["Generators", "viewof aggr"], (G, _) => G.input(_));
  main.variable(observer("viewof aggratio")).define("viewof aggratio", ["Inputs"], _aggratio);
  main.variable(observer("aggratio")).define("aggratio", ["Generators", "viewof aggratio"], (G, _) => G.input(_));
  main.variable(observer("viewof power")).define("viewof power", ["Inputs"], _power);
  main.variable(observer("power")).define("power", ["Generators", "viewof power"], (G, _) => G.input(_));
  main.variable(observer("pow")).define("pow", ["power"], _pow);
  main.variable(observer()).define(["repres","set","viewof ratio"], _10);
  main.variable(observer()).define(["aggr","set","viewof aggratio"], _11);
  main.variable(observer("zoom_domain")).define("zoom_domain", ["turf","rayons","aggratio"], _zoom_domain);
  main.variable(observer("proj")).define("proj", _proj);
  main.variable(observer("turf")).define("turf", ["require"], _turf);
  main.variable(observer("flubber")).define("flubber", ["require"], _flubber);
  main.variable(observer("rayons")).define("rayons", ["FileAttachment"], _rayons);
  main.variable(observer("oblasts")).define("oblasts", ["FileAttachment"], _oblasts);
  main.variable(observer("centers")).define("centers", ["apply","rayons","turf"], _centers);
  main.variable(observer("circles")).define("circles", ["apply","centers","turf"], _circles);
  main.variable(observer("voronoys")).define("voronoys", ["turf","oblasts","centers","apply_all","apply"], _voronoys);
  main.variable(observer("circle_coords")).define("circle_coords", ["circles"], _circle_coords);
  main.variable(observer("rayons_coords")).define("rayons_coords", ["rayons"], _rayons_coords);
  main.variable(observer("voronoys_coords")).define("voronoys_coords", ["voronoys"], _voronoys_coords);
  main.variable(observer("project_polygons")).define("project_polygons", ["structuredClone","proj"], _project_polygons);
  main.variable(observer("apply")).define("apply", ["structuredClone","turf"], _apply);
  main.variable(observer("apply_all")).define("apply_all", ["structuredClone"], _apply_all);
  main.variable(observer("set")).define("set", ["Event"], _set);
  main.variable(observer("interps")).define("interps", ["flubber","rayons_coords","circle_coords"], _interps);
  main.variable(observer("midshape")).define("midshape", ["interps","ratio","structuredClone","turf"], _midshape);
  main.variable(observer("midpolygons")).define("midpolygons", ["midshape","turf","rayons"], _midpolygons);
  main.variable(observer("oblast_coords")).define("oblast_coords", ["oblasts"], _oblast_coords);
  main.variable(observer("rayons_coords_obl")).define("rayons_coords_obl", ["oblasts","rayons"], _rayons_coords_obl);
  main.variable(observer("circles_coords_obl")).define("circles_coords_obl", ["oblasts","circles"], _circles_coords_obl);
  main.variable(observer("voronoys_coords_obl")).define("voronoys_coords_obl", ["oblasts","voronoys"], _voronoys_coords_obl);
  main.variable(observer("mean_obl")).define("mean_obl", ["oblasts","centers"], _mean_obl);
  main.variable(observer("combinecircles")).define("combinecircles", ["oblast_coords","flubber","circles_coords_obl","voronoys_coords_obl"], _combinecircles);
  main.variable(observer("combineshape")).define("combineshape", ["combinecircles","circles_coords_obl","aggratio","structuredClone","turf"], _combineshape);
  main.variable(observer("combinepolygons")).define("combinepolygons", ["combineshape","rayons","turf","pow","aggratio","mean_obl"], _combinepolygons);
  return main;
}
