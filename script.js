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
    updateThumbPlacement();
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

  clampToMax(input);

}

function clampToMax(input) {
  
  let val = input.valueAsNumber;
  
  if (Number.isNaN(val)) return;

  
  const max = (input.max !== "") ? parseFloat(input.max) : Infinity;
  if (Number.isNaN(max)) return;

  if (val > max) {
    input.value = String(max);
  }
}

function restoreIfEmpty(input) {
  // if (input.value === "" || isNaN(input.value)) {
  //   input.value = 0;
  // }
  // calculate();
  //   updateAllSliderFills();
  //   updateThumbPlacement();
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



const getUnitForID = (id) => {
  return document.querySelector(`#${id} + .metric-unit`)?.innerText || "";
}
function exportPDF() {
  const doc = new jspdf.jsPDF("p", "mm", "a4");


  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Green Calculator Toolkit Report", 105, 20, { align: "center" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);


  const trees = +document.getElementById("trees").value || 0;
  const species = +document.getElementById("species").value || 0;
  let area = +document.getElementById("area").value || 0;
  const duration = +document.getElementById("duration").value || 0;


  const unit = document.querySelector('input[name="btnradio"]:checked').value === "m2" ? "m²" : "ac";


  doc.setFont("Helvetica", "bold");
  doc.text("Input Values", 14, 45);

  const tableOptions = {
  theme: "grid",
  tableWidth: "auto",
  styles: { cellPadding: 3, fontSize: 10 },
  headStyles: { fillColor: [25, 135, 84] },
  columnStyles: {
    0: { cellWidth: 90 },
    1: { cellWidth: 90 }
  }
};

  doc.autoTable({
    startY: 50,
    theme: "grid",
    head: [["Field", "Value"]],
    body: [
      ["Total Trees", trees],
      ["Species Count", species],
      ["Area", `${area} ${unit}`],
      ["Duration", `${duration} years`]
    ],
    ...tableOptions
  });


  const co2 = document.getElementById("co2").innerText || "";
  const oxygen = document.getElementById("biodiversity").innerText || "";
  const cooling = document.getElementById("cooling").innerText || "";
  const air = document.getElementById("air").innerText || "";
  const stormwater = document.getElementById("stormwater").innerText || "";
  const branding = document.getElementById("branding").innerText || "";

  doc.setFont("Helvetica", "bold");
  doc.text("Impact Results", 14, doc.lastAutoTable.finalY + 10);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["CO2 Sequestration", `${co2} ${getUnitForID("co2")}`],
      ["Biodiversity Index", oxygen],
      ["Cooling Effect", `${cooling} ${getUnitForID("cooling")}`],
      ["Air Quality Improvement", `${air} ${getUnitForID("air")}`],
      ["Stormwater Retention", `${stormwater} ${getUnitForID("stormwater")}`],
      ["Green Branding Score", branding]
    ],
    ...tableOptions
  });

  doc.setFontSize(10);
  //doc.text("© Green Impact Calculator", 105, 287, { align: "center" });
  doc.text("© 2025 KliSus Systems — Green Calculator Toolkit. All rights reserved.", 105, 287, { align: "center" });
  doc.save("GreenCalculatorToolkitReport.pdf");
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










function populateReportData() {
      

      document.getElementById("report-section").textContent = new Date().toLocaleDateString();
      

        const idMappings = [
          {
            indexId: "trees",
            reportId: ".report-overview-table > tr:nth-child(3) > td:nth-child(1)"
          },
          {
            indexId: "species",
            reportId: ".report-overview-table > tr:nth-child(3) > td:nth-child(2)"
          },
          {
            indexId: "area",
            reportId: ".report-overview-table > tr:nth-child(5) > td:nth-child(1)"
          },
          {
            indexId: "duration",
            reportId: ".report-overview-table > tr:nth-child(5) > td:nth-child(2)"
          },
          {
            indexId: "co2",
            reportId: "#co2Cell > span > span"
          },
          {
            indexId: "biodiversity",
            reportId: "#bioCell > span > span"
          },
          {
            indexId: "cooling",
            reportId: "#coolingCell > span > span"
          },
          {
            indexId: "air",
            reportId: "#airCell > span > span"
          },
          {
            indexId: "stormwater",
            reportId: "#stormCell > span > span"
          },
          {
            indexId: "branding",
            reportId: "#scoreCell > span > span"
          }
        ];
        document.querySelector(".score-table > tr:nth-child(2) td").textContent = document.querySelector(idMappings[9].reportId).textContent;
      // Populate DOM
      // for (const [key, value] of Object.entries(data)) {
      //   const el = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
      //   if (el) el.textContent = value;
      // }

      for(const {indexId, reportSelector} of idMappings) {
        document.querySelector(`${reportSelector}`).textContent = document.getElementById(indexId).textContent;
      }
    }

    // async function generatePDF() {
    //   populateReportData();
    //   const { jsPDF } = window.jspdf;
    //   const report = document.getElementById("report");

    //   const canvas = await html2canvas(report, { scale: 2 });
    //   const imgData = canvas.toDataURL("image/png");
    //   const pdf = new jsPDF("p", "in", "a4");
    //   const pageWidth = 8.27;
    //   const imgWidth = pageWidth;
    //   const imgHeight = canvas.height * imgWidth / canvas.width;

    //   pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    //   pdf.save("report.pdf");
    // }

//   async function generatePDF() {
//   // Fetch the report.html template
//   const response = await fetch("report.html");
//   const html = await response.text();

//   // Create a detached DOM (not visible on page)
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//   // --- Fill template values from index.html ---
//   const data = {
//     trees: document.getElementById("trees")?.value || 0,
//     species: document.getElementById("species")?.value || 0,
//     area: document.getElementById("area")?.value || 0,
//     duration: document.getElementById("duration")?.value || 0,
//     co2: document.getElementById("co2")?.textContent || "0",
//     biodiversity: document.getElementById("biodiversity")?.textContent || "0",
//     cooling: document.getElementById("cooling")?.textContent || "0",
//     air: document.getElementById("air")?.textContent || "0",
//     stormwater: document.getElementById("stormwater")?.textContent || "0",
//     branding: document.getElementById("branding")?.textContent || "0",
//   };

//   // Fill Overview section
//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = data.trees;
//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = data.species;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${data.area} m²`;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${data.duration} years`;

//   // Fill metrics
//   doc.querySelector("#co2Cell > span > span").textContent = data.co2;
//   doc.querySelector("#bioCell > span > span").textContent = data.biodiversity;
//   doc.querySelector("#coolingCell > span > span").textContent = data.cooling;
//   doc.querySelector("#airCell > span > span").textContent = data.air;
//   doc.querySelector("#stormCell > span > span").textContent = data.stormwater;
//   doc.querySelector("#scoreCell > span > span").textContent = data.branding;

//   // Score summary
//   doc.querySelector(".score-table tr:nth-child(2) td").textContent = data.branding;

//   // Update generation date
//   const now = new Date();
//   doc.querySelector("#report-date span").textContent =
//     now.toLocaleDateString() + ", " + now.toLocaleTimeString();

//   // --- Render PDF ---
//   const reportDiv = doc.getElementById("report");
//   document.body.appendChild(reportDiv); // temporarily attach to measure CSS

//   const canvas = await html2canvas(reportDiv, { scale: 2 });
//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jspdf.jsPDF("p", "mm", "a4");
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = (canvas.height * pageWidth) / canvas.width;

//   pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
//   pdf.save("GreenCalculatorReport.pdf");

//   reportDiv.remove(); // clean up
// }


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
