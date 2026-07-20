const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');

// 🔍 1. What did I even download? Log the whole thing.
console.log('1) world:', world);
//    → an object with keys: {type, objects, arcs, bbox, transform}
//    → "objects" looks like where the map layers live. Let's open it.

// 🔍 2. What's inside world.objects?
console.log('2) world.objects:', world.objects);
//    → {countries: {…}, land: {…}}
//    → AHA — there are two layers. I want "countries". Now I know to write world.objects.countries

// 🔍 3. So what is world.objects.countries by itself?
console.log('3) world.objects.countries:', world.objects.countries);
//    → {type: "GeometryCollection", geometries: Array(177)}
//    → It's still the COMPRESSED topojson (full of "arcs" numbers) — D3 can't draw this yet.
//    → That's WHY I need topojson.feature() to unpack it.

// 🔍 4. Unpack it and see what comes out.
const countries = topojson.feature(world, world.objects.countries);
console.log('4) countries:', countries);
//    → {type: "FeatureCollection", features: Array(177)}
//    → NOW it has a ".features" array — the drawable shapes!

// 🔍 5. Confirm the features and peek at one.
console.log('5) how many:', countries.features.length);   // 177
console.log('6) first country:', countries.features[0]);  // {type:"Feature", id:"242", properties:{name:"Fiji"}, …}
