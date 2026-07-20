# Visa Denial Rate by Country

A world map that colors each country by its 2025 US B-visa refusal rate. Built with D3 and TopoJSON. Darker red means a higher denial rate; countries with no data are gray. Hover a country to see its name and rate.

## Run it

```
python3 -m http.server 8000
```

Then open http://localhost:8000/index-withData.html

## Files

- `index-withData.html` — the page. Loads D3, topojson-client, and `script2.js`.
- `script2.js` — the working version. Draws the map and colors it from the data.
- `base.css` / `custom.css` — reset and layout.
- `data/cleaned_refusal.csv` — the data the map reads.
- `data/2025-us-b-visa-denial-rate.csv` — the raw source, refusal rates as percent strings.
- `data/reivew.ipynb` — the notebook that cleaned the raw file into `cleaned_refusal.csv`.

`script.js` and `script3.js` are earlier drafts kept for reference. `script.js` was an experiment coloring by a different dataset (healthy life expectancy); `script3.js` is just console logging used to figure out the TopoJSON structure. Neither is loaded by the page.

## How it works

`script.js`:

1. Sets up an Equal Earth projection and an SVG.
2. Loads the world shapes from world-atlas (TopoJSON) and unpacks them with `topojson.feature()`.
3. Loads `cleaned_refusal.csv` and builds a lookup from ISO country number to refusal rate.
4. Draws one path per country, filling it by rate with `d3.interpolateReds`.

The join between the map and the data is the ISO numeric code (`iso_num` in the CSV, `feature.id` on the map), kept as a zero-padded string like `"004"`.

## Data

Refusal rates are the FY2025 adjusted B-visa refusal rates by nationality. In `cleaned_refusal.csv` they're stored as decimals (0.6325 = 63.25%).
