const path = window.location.pathname;
const isIndexPage = path.endsWith("index.html") || path.endsWith("/") || path === "";
const isReportPage = path.endsWith("report.html");

let chart;

let areaUnit = "m2";

  const infoIcons = document.querySelectorAll(".branding-info");
    const tooltips = document.querySelectorAll(".branding-tooltip");
    console.log(infoIcons);
    console.log(tooltips);


    infoIcons.forEach((infoIcon, index) => {
      const tooltip = tooltips[index];
      infoIcon.addEventListener('click', (e) => {

        tooltips.forEach(t => {
          if (t !== tooltip) t.style.display = 'none';
        });
        
        tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
        console.log("tooltip.style.display");
        e.stopPropagation();
      });
    });


    document.addEventListener('click', (e) => {
      infoIcons.forEach((infoIcon, index) => {
        const tooltip = tooltips[index];
        if (!infoIcon.contains(e.target) && !tooltip.contains(e.target)) {
          tooltip.style.display = 'none';
        }
      });
    });



const radioButtons = document.querySelectorAll('input[name="btnradio"]');
let selectedUnit = "m2";


radioButtons.forEach(radioButton => {
  const unitValue = document.querySelector(".number-with-unit > input[type='number']");
  const unitRange = document.querySelector("#areaRange");
  const unitType = document.querySelector(".number-with-unit > span");

  radioButton.addEventListener('change', function() {

    let rawValue = parseFloat(unitValue.value) || 0;

    selectedUnit = document.querySelector('input[name="btnradio"]:checked').value;

    if (selectedUnit === "m2") {
      unitType.textContent = "m²";
      rawValue = rawValue * 4046.86;
      unitRange.max = 100000;
    } 
    else {
      unitType.textContent = "ac";
      rawValue = rawValue / 4046.86;
      unitRange.max = 25;
    }

    rawValue = Math.min(Math.max(rawValue, unitRange.min), unitRange.max);

    unitValue.value = rawValue;
    unitRange.value = rawValue;

    calculate();
    updateAllSliderFills();
    //updateThumbPlacement();
  });
});




function updateAllSliderFills() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #7acb8a 0%, #7acb8a ${percent}%, #f0f0f0 ${percent}%, #f0f0f0 100%)`;
  });
}

function validateNonNegative(input) {
  if (input.value.startsWith("-")) {
    input.value = input.value.replace("-", "");
  }

}







const updateThumbPlacement = () => {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const thumb = slider.parentElement.querySelector('.slider-thumb');
    if (!thumb) return;

    const min = slider.min ? parseFloat(slider.min) : 0;
    const max = slider.max ? parseFloat(slider.max) : 100;
    const val = parseFloat(slider.value);

    const percent = ((val - min) / (max - min)) * 100;

    thumb.style.left = `calc(${percent}% - (var(--thumb-size) / 2))`;
    thumb.textContent = val;
  });
};



function syncInput(numId, rangeId) {
  const numInput = document.getElementById(numId);
  const rangeInput = document.getElementById(rangeId);
  numInput.value = rangeInput.value;
  updateAllSliderFills();
  calculate();
}

function syncSlider(numId, rangeId) {
  const numInput = document.getElementById(numId);
  const rangeInput = document.getElementById(rangeId);
  rangeInput.value = numInput.value;
  updateAllSliderFills();
  calculate();
}


function calculate() {

  const trees = +document.getElementById("trees").value || 0;
  const species = +document.getElementById("species").value || 0;
  let area = +document.getElementById("area").value || 0;
  const duration = +document.getElementById("duration").value || 0;

    if(selectedUnit == "ac") {
      area = area * 4046.86;
    }

  formatMetricValues((trees * 21.8).toFixed(1), "co2");
  formatMetricValues(area > 0 ? ((species / area) * 100).toFixed(2) : 0, "biodiversity")
  formatMetricValues(((area / 100) * 0.2).toFixed(2), "cooling");
  formatMetricValues((trees * 0.12).toFixed(2), "air");
  formatMetricValues((area * 100).toFixed(0).toLocaleString(), "stormwater");
  formatMetricValues(Math.log(trees + species + duration || 1).toFixed(2), "branding");


}


if(isIndexPage){
  calculate();
  updateAllSliderFills();
}



function formatMetricValues(value, className) {
  
  const [intPart, decPart] = Number(value).toFixed(2).split('.');
  if(decPart === undefined) {
    document.getElementById(className).innerHTML = value;
    return;
  }
  intPartFormatted = parseInt(intPart.replace(/,/g, '')).toLocaleString();
  document.getElementById(className).innerHTML = `${intPartFormatted}.<span class="decimal">${decPart}</span>`;
}



async function generatePDF() {
  
  const response = await fetch("report.html");
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  
  const data = {
    trees: document.getElementById("trees")?.value || 0,
    species: document.getElementById("species")?.value || 0,
    area: document.getElementById("area")?.value || 0,
    duration: document.getElementById("duration")?.value || 0,
    co2: document.getElementById("co2")?.textContent || "0",
    biodiversity: document.getElementById("biodiversity")?.textContent || "0",
    cooling: document.getElementById("cooling")?.textContent || "0",
    air: document.getElementById("air")?.textContent || "0",
    stormwater: document.getElementById("stormwater")?.textContent || "0",
    branding: document.getElementById("branding")?.textContent || "0",
    unit: document.getElementById("areaUnit")?.textContent || "m²"
  };

  

  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = data.trees;
  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = data.species;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${data.area} ${data.unit}`;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${data.duration} years`;

  doc.querySelector("#co2Cell > span > span").textContent = data.co2;
  doc.querySelector("#bioCell > span > span").textContent = data.biodiversity;
  doc.querySelector("#coolingCell > span > span").textContent = data.cooling;
  doc.querySelector("#airCell > span > span").textContent = data.air;
  doc.querySelector("#stormCell > span > span").textContent = data.stormwater;
  doc.querySelector("#scoreCell > span > span").textContent = data.branding;
  doc.querySelector(".score-table tr:nth-child(2) td").textContent = data.branding;

  

  const now = new Date();
  doc.querySelector("#report-date").textContent =
    now.toLocaleDateString() + ", " + now.toLocaleTimeString();

  
  const reportDiv = doc.getElementById("report");
  

  
  reportDiv.style.width = "210mm";
  reportDiv.style.minHeight = "297mm";
  reportDiv.style.padding = "10mm";
  reportDiv.style.background = "#fff";
  reportDiv.style.boxSizing = "border-box";

  document.body.appendChild(reportDiv);

  const canvas = await html2canvas(reportDiv, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    scrollY: 0,
    windowWidth: reportDiv.scrollWidth,
    windowHeight: reportDiv.scrollHeight
  });

  const imgData = canvas.toDataURL("image/jpeg");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();


  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;


  const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
  const finalWidth = imgHeight > pageHeight ? (pageHeight * canvas.width) / canvas.height : imgWidth;

  const xOffset = (pageWidth - finalWidth) / 2;
  const yOffset = (pageHeight - finalHeight) / 2;

  pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
  pdf.save("GreenCalculatorReport.pdf");

  reportDiv.remove();
}
