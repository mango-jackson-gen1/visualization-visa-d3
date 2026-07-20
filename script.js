// reference: https://observablehq.com/@d3/world-choropleth/2
// Code runs TOP TO BOTTOM, so each thing must be defined BEFORE it is used:
//   1) map math  ->  2) create svg  ->  3) load map  ->  4) draw

// (Your data-loading step, for later — still commented out)
// const data = (await d3.csv("data/cleaned_refusal.csv")).map(d => ({
//   id:   (d.iso_num || "").padStart(3, "0"),  // JOIN KEY — matches feature.id "004"
//   name: d.name_short,                        // label for the tooltip
//   rate: +d.Refusal_Rate                      // the VALUE to color by
// }));


// ── STEP 1: define a drawing area like in p5. so this section can be used as a reference 
//for topojson. nothing is drawn yet

const width = 928;
const marginTop = 46;
const height = width / 2 + marginTop;

// projection = flattens the round globe onto the flat screen.
// path       = uses that projection to turn each country into an SVG "d" string.
// Fit the projection.
//path
// converts a whole country at once. A country is hundreds of points. 
// path wraps the projection and does the whole outline, producing the final d string an SVG <path> needs
const projection = d3.geoEqualEarth().fitExtent([[2, marginTop + 2], [width - 2, height]], {type: "Sphere"});
const path = d3.geoPath(projection);
// window.projection = projection;   // debug helper: lets you type `projection` in the console
// window.path = path;               // debug helper: lets you type `path` in the console

// ── STEP 2: create the SVG container ON the page
const svg = d3.select('#my-svg-chart')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

// ── STEP 3.1: load the map data (must exist before we use `countries`) ────────
// world     = the raw COMPRESSED file (TopoJSON) — can't be drawn directly.
// countries = the UNPACKED drawable shapes (GeoJSON) — 177 country features.
const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');

const countries = topojson.feature(world, world.objects.countries);
window.countries = countries;   // debug: lets the console see `countries`
//console.log('countries loaded:', countries.features.length);   // should be ~177

// ── STEP 3.2: load the csv 
const data = (await d3.csv("data/cleaned_refusal.csv")).map(d => ({
    id:   d.iso_num,        // JOIN KEY — string "004", matches feature.id
    name: d.name_short,     // label
    rate: +d.Refusal_Rate   // VALUE (the + makes it a number)
  }));
  //window.data = data;

// ── STEP 3.3: build the lookup table + color scale (the "binding" prep) ──────
// valuemap = a Map from ISO number  ->  refusal rate, e.g. "004" -> 0.6325.
// valuemap.get(id) to find ANY country's rate instantly.
const valuemap = new Map(data.map(d => [d.id, d.rate]));
window.valuemap = valuemap;   // ADD THIS — now the console can see it

// color = a function that turns a rate (0..~0.63) into a color.
// scaleSequential auto-figures the input range from d3.extent(...the rates).
// interpolateReds: higher denial rate -> deeper red.
// .unknown("#eee") = the color to use when we have NO data for a country.
// This lets the fill below stay a clean one-liner (no if/else needed).
const color = d3.scaleSequential(d3.extent(valuemap.values()), d3.interpolateReds).unknown("#eee");

//now set up is done
// ── STEP 4: draw the ocean background (a white sphere with a black border) ──
// Drawn BEFORE the countries so they layer on top of it.
svg.append("path")
  .datum({type: "Sphere"})
  .attr("fill", "white")
  .attr("stroke", "currentColor")
  .attr("d", path);

// ── STEP 5: draw one <path> per country AND color it by the data ────────────
// .data(countries.features) binds ONE feature (country shape) to each <path>.
// Inside .attr("fill", ...), `d` IS that feature, so d.id is its ISO number.
// color(valuemap.get(d.id))  ==  color( this country's rate )  ->  a red shade.
// Missing countries fall back to "#eee" automatically (see .unknown above).
svg.append("g")
  .selectAll("path")
  .data(countries.features)
  .join("path")
    .attr("fill", d => color(valuemap.get(d.id)))
    //.each(d => console.log(d.id, d.properties.name, valuemap.get(d.id), color(valuemap.get(d.id))))  // TEMP
    .attr("stroke", "#ffffff")
    .attr("d", path)
  .append("title")   // native hover tooltip, one per country
    .text(d => {
      const rate = valuemap.get(d.id);                 // e.g. 0.008  (a fraction, not a %)
      const label = rate == null                       // no row in the CSV for this country
        ? "no data"
        : d3.format(".1%")(rate);                       // 0.008 -> "0.8%",  0.6325 -> "63.3%"
      return `${d.properties.name}\n${label}`;
    });


