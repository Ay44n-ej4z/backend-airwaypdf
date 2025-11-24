// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { jsPDF } = require("jspdf");
const app = express();

app.use(bodyParser.json());

// --- Air Waybill Data (from MAWB EXAMPLE-1.pdf) ---
const awbData = {
  awbPrefix: "098",
  awbNumber: "4469 8485",

  shipper: {
    name: "ONEGLOBE LOGISTICS PTE. LTD.",
    address:
      "115 Airport Cargo Road, #02-09, Cargo Agents Building C, SINGAPORE\nSingapore 815466",
    account: "", // Empty in PDF
  },
  consignee: {
    name: "GOOCHU GLOBAL LOGISTICS PRIVATE LIMITED",
    address:
      "A-416, 2ND FLOOR, ROAD NO. 04, STREET NO. 10, MAHIPALPUR EXTN.\nCAAR NO. AAHCG1358H-CN-INDEL4, 110037, INDIA",
    telephone: "+91 7987755773",
    account: "", // Empty in PDF
  },

  agent: {
    nameCity: "ONEGLOBE LOGISTICS PTE. LTD.\nSINGAPORE",
    iataCode: "", // Empty in PDF
    accountNo: "", // Empty in PDF
    notify: "", // Empty in PDF
  },

  accountingInfo: "***FREIGHT PREPAID***",

  airport: {
    departure: "SINGAPORE",
    destination: "NEW DELHI",
    routingTo: "DEL", // TO field in routing table
  },

  routing: {
    carrier1: "AI",
    flightNoDate: "A12381 / 10/09/2025",
    currency: "SGD",
    chgsCode: "PPD", // Prepaid marked with X
    valDeclared: "NVD", // Declared Value of Carriage
    valForCustoms: "NCV", // Declared Value for Customs
    insAmount: "NIL",
  },

  handling:
    "PLEASE NOTIFY THE CONSIGNEE IMMEDIATELY UPON ARRIVAL\nSHIPMENT DOES NOT CONTAIN ANY DANGEROUS GOODS\nITEM ON SAID AWB DOES NOT CONTAIN ANY VIVO PORTABLE ELECTRONIC DEVICES",

  natureOfGoods: "CONSOLIDATION AS PER MANIFEST\nATTACHED\n (MHE)\n123X120X100 CM / 2",
  goodsRouting: "House No: OGLAE252331, OGLAE252330",

item: {
  pieces: 2,
  grossWeight: 816.0,
  kgLbIndicator: "K",     // for kg/Lb column
  rateClass: "Q",         // for Rate Class column
  chargeableWeight: 816.0,
  rateCharge: 7.31,
  totalCharge: 5964.96
},


  otherChargesDueCarrier: 10.0,
  totalPrepaid: 5974.96,
  totalCollect: 0.0,
  date: "09/09/2025",
  executedAt: "SINGAPORE",
  signatureName: "SHAMBHAVI",
};

// ----- ROUTE: Generate Air Waybill PDF -----
app.get("/generate-pdf", async (req, res) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      // format: [210, 330], // width, height in mm

    });

    // --- CONSTANTS & LAYOUT ---
    const marginLeft = 10;
    const marginTop = 10;
    const pageWidth = 190; // A4 width minus left/right margins (approx)
    const leftColWidth = 95.0;
    const rightColWidth = pageWidth - leftColWidth;
    let currentY = marginTop;

    // Footer position and minimum spacing
    const footerY = 285.0;


    // small helpers ------------------------------------------------------
    const drawMultilineInBox = (x, y, boxW, boxH, text, fontSize = 6, padding = 1) => {
      doc.setFontSize(fontSize);
      const maxWidth = boxW - padding * 2;
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.7;
      // fit lines into boxH - if too many, truncate with ellipsis
      const maxLines = Math.floor((boxH - padding * 2) / lineHeight);
      const toDraw = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        // add ellipsis to last line
        const last = toDraw[toDraw.length - 1];
        toDraw[toDraw.length - 1] = last.replace(/\s*\S{0,4}$/, "...");
      }
      let ty = y + padding + fontSize;
      toDraw.forEach((ln) => {
        doc.text(ln, x + padding, ty);
        ty += lineHeight;
      });
    };

    // small boxed header with an account area on right
    const drawHeaderBox = (x, y, width, height, label, content, accountLabel, account) => {
      doc.setLineWidth(0.4);
      doc.rect(x, y, width, height, "S");
      const headerH = 7.0;
      doc.line(x, y, x + width, y);


      doc.setFontSize(6);
      doc.text(label, x + 1.2, y + 4.2);

      // account small grey box right side
      const accountBoxW = 48.0;
      const accountX = x + width - accountBoxW;
      doc.setFillColor(235, 235, 235);
      doc.rect(accountX, y, accountBoxW, headerH, "F");
      doc.rect(accountX, y, accountBoxW, headerH, "S");  // draw border around grey box
      doc.setFontSize(5);
      doc.text(accountLabel, accountX + 8.5, y + 2.5);
      doc.setFontSize(8);
      doc.text(account, accountX + 8.5, y + 5.0);

      // content area
      drawMultilineInBox(x + 1.2, y + headerH - 5, width - 2.4, height - headerH - 3, content, 8, 1.2);
      doc.setFontSize(6);
    };

    // styling defaults
    doc.setFont("helvetica");
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.35);

    // ------------------ AWB top header ------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    // left small AWB line - exactly as in PDF
    doc.text(`${awbData.awbPrefix} SIN | ${awbData.awbNumber}`, marginLeft, currentY - 2);
    // right AWB big
    doc.setFontSize(10);
    doc.text(`${awbData.awbPrefix} - ${awbData.awbNumber}`, marginLeft + 163, currentY - 2);
doc.setFont("helvetica", "normal");
  // Make both in bold
doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Not Negotiable", marginLeft + leftColWidth + 2, currentY + 3);
    doc.setFontSize(12);
    doc.text("Air Waybill", marginLeft + leftColWidth + 2, currentY + 9);
    doc.setFontSize(6);
     doc.text("Issued By", marginLeft + leftColWidth + 2, currentY + 12);
    // reset font to normal for next items
doc.setFont("helvetica", "normal");

    // Carrier small box (top right)
    const carrierBoxX = marginLeft + leftColWidth + 75;
    // doc.rect(carrierBoxX, currentY + 0.6, 35, 8, "S");
     // Make both in bold
doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AIR INDIA", carrierBoxX + 2, currentY + 6.4);

    // reset font to normal for next items
doc.setFont("helvetica", "normal");
    doc.setFontSize(6);

    // ------------------ ROW 1: SHIPPER & CONDITIONS ------------------
    const rowHeight1 = 25.0;
    drawHeaderBox(marginLeft, currentY, leftColWidth, rowHeight1, "SHIPPER'S NAME & ADDRESS", awbData.shipper.name + "\n" + awbData.shipper.address, "SHIPPER'S ACCOUNT NUMBER", awbData.shipper.account || "");

    // Right - Conditions box
    doc.rect(marginLeft + leftColWidth, currentY, rightColWidth, rowHeight1, "S");
    

  // 🔹 Add horizontal line before conditions text
  // Shift the conditions separator slightly down and to the right
  const conditionsLineShiftX = 0.2; // mm to move right
  const conditionsLineShiftY = 1.0; // mm to move down
  doc.line(
    marginLeft + leftColWidth + conditionsLineShiftX,
    currentY + 20.5 + conditionsLineShiftY,
    marginLeft + leftColWidth + rightColWidth + conditionsLineShiftX,
    currentY + 20.5 + conditionsLineShiftY
  );


// ⭐ MAKE CONDITIONS TEXT BOLD
doc.setFont("helvetica", "bold");


    const conditionsText =
      "Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity.\nIt is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY.";
    drawMultilineInBox(marginLeft + leftColWidth + 1.5, currentY + 17.5, rightColWidth - 3, rowHeight1 + 10, conditionsText, 5, 1);

  // reset normal font for next content
doc.setFont("helvetica", "normal");


    currentY += rowHeight1;

    // ------------------ ROW 2: CONSIGNEE & ACCOUNTING ------------------
    const consigneeText = awbData.consignee.name + "\n" + awbData.consignee.address + "\nTelephone No.: " + awbData.consignee.telephone;
    drawHeaderBox(marginLeft, currentY, leftColWidth, rowHeight1, "CONSIGNEE'S NAME & ADDRESS", consigneeText, "CONSIGNEE'S ACCOUNT NUMBER", awbData.consignee.account || "");

    doc.rect(marginLeft + leftColWidth, currentY, rightColWidth, rowHeight1, "S");
    doc.setFontSize(5);

    doc.text("Accounting Information", marginLeft + leftColWidth + 2, currentY + 27);
    doc.setFontSize(5);
    // use split for accounting info in box
     doc.setFont("helvetica", "bold");
     //***FREIGHT PREPAID*** text size we can adjust to fit
      drawMultilineInBox(
       marginLeft + leftColWidth + 20,
       currentY + 25,
       rightColWidth - 6,
       rowHeight1 - 8,
      awbData.accountingInfo,
      7,  // smaller font size
      1
);

    doc.setFont("helvetica", "normal");  // reset back to normal
    doc.setFontSize(6);
    currentY += rowHeight1;

    // ------------------ ROW 3: AGENT NAME & ROUTING ------------------
    doc.rect(marginLeft, currentY, leftColWidth, rowHeight1, "S");
    
    doc.setFontSize(5);
    doc.text("ISSUING CARRIER'S AGENT NAME AND CITY", marginLeft + 1.2, currentY + 4.2);
    doc.setFontSize(6);
    drawMultilineInBox(marginLeft + 1.2, currentY + 0.5, leftColWidth - 2.4, rowHeight1 - 8, awbData.agent.nameCity, 8, 1.2);
    doc.setFontSize(6);

    // routing box
    doc.rect(marginLeft + leftColWidth, currentY, rightColWidth, rowHeight1, "S");
    doc.setFontSize(5);

    doc.setFontSize(5);
doc.text(
  "AIRPORT OF DEPARTURE (ADDRESS OF FIRST CARRIER) AND REQUESTED ROUTING",
  marginLeft + leftColWidth - 93,
  currentY + 27
);
doc.setFontSize(6);
doc.text(
  "SINGAPORE",
  marginLeft + leftColWidth - 93,
  currentY + 31
);
 
    // doc.text("AIRPORT OF DEPARTURE AND ROUTING", marginLeft + leftColWidth + 2, currentY + 3);
    doc.setFontSize(6);
    // doc.text("To", marginLeft + leftColWidth + 2, currentY + 8);
  
    doc.setFontSize(6);
    // doc.text("By First Carrier", marginLeft + leftColWidth + 2, currentY + 14);
   
    doc.setFontSize(6);
    // doc.text("AIRPORT OF DEPARTURE (ADDRESS OF FIRST CARRIER) AND REQUESTED ROUTING", marginLeft + leftColWidth + 2, currentY + 19);
    doc.setFontSize(6);
    currentY += 16;

      // move row 4 upward by 1.5mm

    // ------------------ ROW 4: IATA / ACCOUNT / NOTIFY ------------------
    const rowHeight4 = 17.0;
    doc.rect(marginLeft, currentY, leftColWidth, rowHeight4, "S");
    doc.setFontSize(5);
    doc.text("AGENT'S IATA CODE", marginLeft + 1.2, currentY + 3);
    doc.text("ACCOUNT NO", marginLeft + 47, currentY + 3);
    doc.line(marginLeft + 45.0, currentY, marginLeft + 45.0, currentY + rowHeight4-8);
    doc.setFontSize(8);
    doc.text(awbData.agent.iataCode || "", marginLeft + 1.2, currentY + 8);
    doc.text(awbData.agent.accountNo || "", marginLeft + 47, currentY + 8);

    // right notify box
    doc.rect(marginLeft + leftColWidth, currentY, rightColWidth, rowHeight4, "S");
    doc.setFontSize(5);
    doc.text("NOTIFY", marginLeft + leftColWidth + 2, currentY + 3);
    doc.setFontSize(8);
    doc.text(awbData.agent.notify || "", marginLeft + leftColWidth + 2, currentY + 8);
    doc.setFontSize(6);
    // doc.line(marginLeft, hLineTable1Y, marginLeft + vLineX[vLineX.length - 1] + 59, hLineTable1Y);

    currentY += rowHeight4;

    

    // ------------------ ROW 5: ROUTING TABLE ------------------
    const routingRowHeight = 25.0;
    doc.rect(marginLeft, currentY, pageWidth, routingRowHeight, "S");

    // horizontal splits
    const hLine1Y = currentY + 13.0;

    // Small vertical line (height 10mm)
   const smallVLineX = marginLeft + 12;  // X position
   const smallVLineY = currentY + 0.2;     // Y start
   doc.line(smallVLineX, smallVLineY, smallVLineX, smallVLineY + 13);
   
   // Small vertical lines (12 lines total)

// Line 1
doc.line(marginLeft + 160, currentY + 0.2, marginLeft + 160, currentY + 13.2);

// Line 2
doc.line(marginLeft + 130, currentY + 0.2, marginLeft + 130, currentY + 13.2);

// Line 3
doc.line(marginLeft + 125, currentY + 0.2 +3.5, marginLeft + 125, currentY + 13.2);

// Line 4
doc.line(marginLeft + 120, currentY + 0.2, marginLeft + 120, currentY + 13.2);

// Line 5
doc.line(marginLeft + 115, currentY + 0.2 + 3.5, marginLeft + 115, currentY + 13.2);

// Line 6
doc.line(marginLeft + 50, currentY + 0.2, marginLeft + 50, currentY + 13.2);

// Line 7
doc.line(marginLeft + 110, currentY + 0.2, marginLeft + 110, currentY + 13.2);

// Line 8
doc.line(marginLeft + 62, currentY + 0.2 , marginLeft + 62, currentY + 13.2);

// Line 9
doc.line(marginLeft + 104, currentY + 0.2, marginLeft + 104, currentY + 13.2);

// Line 10
doc.line(marginLeft + 74, currentY + 0.2, marginLeft + 74, currentY + 13.2);

// Line below
doc.line(marginLeft + 122, currentY + 0.2 + 13, marginLeft + 122, currentY + 12.2 + 13);
// Line below
doc.line(marginLeft + 45, currentY + 0.2 + 13, marginLeft + 45, currentY + 12.2 + 13);

// below small line adjust form here under u shape 
doc.line(
  marginLeft + 66,
  currentY + 0.2 + 3.5 + 13,
  marginLeft + 66,
  currentY + 13.2 + 13-1
);


// Line 12
doc.line(marginLeft + 85, currentY + 0.2, marginLeft + 85, currentY + 13.2);




    // Small horizontal line (width 20mm)
    const smallHLineX = marginLeft + 55;  // starting X
    const smallHLineY = currentY + 13;    // starting Y
    doc.line(smallHLineX, smallHLineY, smallHLineX + 20, smallHLineY);

    const hLine2Y = currentY + 28.0;
    doc.line(marginLeft, hLine1Y, marginLeft + pageWidth, hLine1Y);
    // doc.line(marginLeft + 107.0, hLine2Y, marginLeft + pageWidth, hLine2Y);
    
    //small horizontal line
    doc.line(smallHLineX +55 , smallHLineY - 9, smallHLineX + 75, smallHLineY -9);
    doc.line(smallHLineX +55 , smallHLineY - 5, smallHLineX + 75, smallHLineY -5);

   

 //big horizontal line
   // BIG horizontal line moved LEFT
const bigLineStart = marginLeft + 12;   // adjust this to move left/right
const bigLineEnd = bigLineStart + 38;   // length 30mm
const bigLineY = smallHLineY - 9;       // same height

doc.line(bigLineStart, bigLineY, bigLineEnd, bigLineY);

// === Vertical divider line between "BY FIRST CARRIER" and "TO" ===
// Adjust this X until the line sits exactly in the center of the header
const dividerX = marginLeft + 28;   // <-- move left/right by changing this number

// Top point of the line (touching the header horizontal line)
const dividerY1 = currentY + 0.2;   // <-- adjust up/down

// Bottom point of the line (same height as other small lines)
const dividerY2 = currentY + 4.0;  // <-- adjust height

// Draw the line
doc.line(dividerX, dividerY1, dividerX, dividerY2);




    // vertical lines
    // const vLines = [10.0, 35.0, 50.0, 65.0, 87.0, 107.0, 127.0, 147.0, 167.0];
     const vLines = [  95.0];
    vLines.forEach((x) => doc.line(marginLeft + x, currentY, marginLeft + x, currentY + routingRowHeight));

 const rectX = marginLeft + 55;  // starting X
const rectY = currentY + 13;     // starting Y
const rectW = 22;               // width
const rectH = 4;                // height

// LEFT vertical line
doc.line(rectX, rectY, rectX, rectY + rectH);

// RIGHT vertical line
doc.line(rectX + rectW, rectY, rectX + rectW, rectY + rectH);

// BOTTOM horizontal line
doc.line(rectX, rectY + rectH, rectX + rectW, rectY + rectH);




    // headers and small labels
    doc.setFontSize(4.5);
    doc.text("TO", marginLeft + 1, currentY + 2.7);
    doc.text("BY FIRST CARRIER", marginLeft + 13, currentY + 2.7);
    doc.text("TO", marginLeft + 55, currentY + 2.7);
    doc.text("AIRPORT OF DESTINATION", marginLeft + 17, currentY + 16);
   // ✈️ Combine Flight + Date header
const combinedHeaderX = marginLeft + 60;   // Adjust left-right position
const combinedHeaderY = currentY + 15.7;    // Adjust up-down position
doc.setFontSize(7);
 doc.text("To", marginLeft + 77, currentY + 3.7);
    doc.text("By", marginLeft + 65, currentY + 3.7);
doc.text("By", marginLeft + 87, currentY + 3.7);

doc.setFontSize(4);
doc.text("Flight No / Date", combinedHeaderX, combinedHeaderY);

    doc.text("CURRENCY", marginLeft + 95.5, currentY + 2.7);
    doc.text("CHGS", marginLeft + 105, currentY + 2.7);
    // doc.text("To", marginLeft + 149, currentY + 2.7);
    doc.text("", marginLeft + 168, currentY + 2.7);
    
    // Second row headers for PPD/COLL
    doc.text("PPD", marginLeft + 110.5, hLine1Y - 6);
    doc.text("COLL", marginLeft + 115.5, hLine1Y - 6);
    doc.text("PPD", marginLeft + 120.5, hLine1Y - 6);
    doc.text("COLL", marginLeft + 125.5, hLine1Y - 6);

doc.setFontSize(4.5);
// WT/VAL header (above first PPD/COLL)
doc.text("WT/VAL", marginLeft + 111, hLine1Y - 10.5);
// Other header (above second PPD/COLL)
doc.text("Other", marginLeft + 122, hLine1Y - 10.5);

    doc.text("DECLARED VALUE OF CARRIAGE", marginLeft + 132, hLine1Y - 10);

    doc.text("DECLARED VALUE FOR CUSTOMS", marginLeft + 161, hLine1Y - 10);

    doc.text("AMOUNT OF INSURANCE", marginLeft + 97, hLine1Y + 3.5);
//Routing and destination text
    doc.setFontSize(4.0);
doc.text("ROUTING AND DESTINATION", marginLeft + 29.4, currentY + 2.5);
doc.rect(marginLeft, currentY, pageWidth, routingRowHeight, "S");

    
    // Data values
    doc.setFontSize(7);
    doc.text(awbData.airport.routingTo, marginLeft + 1, currentY + 5.5); // TO field
    doc.text(awbData.routing.carrier1, marginLeft + 13, currentY + 8.5); // By First Carrier
    // doc.text(awbData.airport.routingTo, marginLeft + 37, currentY + 5.5); // TO field (same as first)
    doc.text(awbData.airport.destination, marginLeft + 2, currentY + 22); // Airport of Destination //Delhi
    const flightMatch = awbData.routing.flightNoDate.match(/(\w+)\s*\/\s*(\d{2}\/\d{2}\/\d{4})/);
    const flight = flightMatch ? flightMatch[1] : "";
    const datePart = flightMatch ? flightMatch[2] : "";
    doc.text(flight || "", marginLeft + 48, currentY + 22.5);  // move flight from here
    doc.text(datePart || "", marginLeft + 68, currentY + 22.5);  // move date from here
    doc.text(awbData.routing.currency, marginLeft + 97, currentY + 9.5); //SGD text move 
    
    // PPD/COLL checkboxes - mark PPD with X
    doc.setFontSize(8);
    doc.text("X", marginLeft + 112, hLine1Y -2); // Charges PPD
    doc.text("X", marginLeft + 121, hLine1Y -2); // Other PPD
    
    doc.setFontSize(8);
    doc.text(awbData.routing.valDeclared, marginLeft + 140, hLine1Y - 4.5); // Declared Value of Carriage (NVD)
    doc.text(awbData.routing.valForCustoms, marginLeft + 170, hLine1Y - 4.5); // Declared Value for Customs (NCV)
    doc.text(awbData.routing.insAmount, marginLeft + 105, hLine1Y + 8.5); // Insurance Amount // NIL text
    // Insurance paragraph (right side text)
doc.setFontSize(4.5);

const insuranceText =
  "INSURANCE - If Carrier offers insurance, and such insurance is requested in " +
  "accordance with the conditions thereof, indicate amount to be insured in figures " +
  'in box marked "Amount of Insurance".';

doc.text(
  insuranceText,
  marginLeft + 125,      // ← move left/right
  hLine1Y + 4,          // ← move up/down
  { maxWidth: 60 }       // limit width so it wraps cleanly
);


    doc.setFontSize(4);
    const disclaimerText =
      "Note: Declared Value for Carriage and Declared Value for Customs are required for all shipments. Consult IATA TACT rules or similar publications for details.";
    const disclaimerX = marginLeft + 108;
    doc.text(disclaimerText, disclaimerX, hLine2Y + 2, { maxWidth: pageWidth - 109, align: "left" });
    doc.setFontSize(6);
    currentY += routingRowHeight;

    // ------------------ ROW 6: HANDLING INFORMATION ------------------
    const handlingRowHeight = 15.0;
    doc.rect(marginLeft, currentY, pageWidth, handlingRowHeight, "S");
    doc.setFontSize(6);
    doc.text("HANDLING INFORMATION", marginLeft + 1.2, currentY + 3.5);
    doc.setFontSize(7);
    drawMultilineInBox(marginLeft + 1.2, currentY + 1, pageWidth - 2.4, handlingRowHeight - 6, awbData.handling, 7, 1.2);
    doc.setFontSize(6);
    currentY += handlingRowHeight;

// ------------------ ROW 7: COMMODITY TABLE ------------------
const tableRowHeight = 65.0;

// Outer border
doc.rect(marginLeft, currentY, pageWidth, tableRowHeight, "S");

// ------------------------------
// 1. GREY COLUMNS (with top gap)
// ------------------------------
doc.setFillColor(230, 230, 230);   // light grey
const topGap = 0.4;                  // reduce height at top

// Rate Class grey column
doc.rect(marginLeft + 34.5, currentY + topGap, 2.0, tableRowHeight - topGap, "F");

// Commodity Item No (disabled grey → uncomment if needed)
// doc.rect(marginLeft + 36.7, currentY + topGap, 2.5, tableRowHeight - topGap, "F");

// Chargeable Weight grey column
doc.rect(marginLeft + 54.0, currentY + topGap, 2.7, tableRowHeight - topGap, "F");

// Rate Charge grey column
doc.rect(marginLeft + 74.5, currentY + topGap, 2.5, tableRowHeight - topGap, "F");

// Total grey column
doc.rect(marginLeft + 97.5, currentY + topGap, 2.5, tableRowHeight - topGap, "F");

// Nature of Goods left grey strip
doc.rect(marginLeft + 129.0, currentY + topGap, 2.5, tableRowHeight - topGap, "F");


// -------------------------------------------
// 2. VERTICAL LINES (except 39.2mm full length)
// -------------------------------------------
const vLineX = [12.0, 31, 34.5, 36.7, 39.2, 54.0, 56.7, 74.5, 77.0, 97.5, 100.0, 129.0, 131.5];

vLineX.forEach((x) => {
  if (x !== 39.2) {
    doc.line(marginLeft + x, currentY, marginLeft + x, currentY + tableRowHeight);
  }
});

// ⭐ Special vertical line with reduced height from top (39.2)
doc.line(
  marginLeft + 39.2,
  currentY + 3,                   // reduced height from top
  marginLeft + 39.2,
  currentY + tableRowHeight
);


// --------------------------
// 3. HORIZONTAL LINES
// --------------------------
const hLineTable1Y = currentY + 7.0;
const hLineTotalY = currentY + tableRowHeight - 10.0;

doc.line(
  marginLeft,
  hLineTable1Y,
  marginLeft + vLineX[vLineX.length - 1] + 59,
  hLineTable1Y
);


// ---------------------------------------------
// 4. THREE SMALL HORIZONTAL LINES YOU ADDED
// ---------------------------------------------
function drawSmallHLine(doc, startX, startY, width) {
  doc.line(startX, startY, startX + width, startY);
}

// small top line under reduced vertical (you added)
drawSmallHLine(doc, marginLeft + 39.0, currentY + 3, 15);

// bottom small lines
drawSmallHLine(doc, marginLeft + 0, currentY + 57, 31);
drawSmallHLine(doc, marginLeft + 100, currentY + 57, 29);


// --------------------------
// 5. HEADERS
// --------------------------
doc.setFontSize(5);
doc.text("No. \nof Pieces\nRCP", marginLeft + 1, currentY + 1.8);
doc.text("Gross\nWeight", marginLeft + 19, currentY + 2.9);
doc.text("kg \n Lb", marginLeft + 31.5, currentY + 2.8);
doc.text("Rate Class", marginLeft + 40, currentY + 1.8);
doc.text("Commodity\nItem No", marginLeft + 43, currentY + 4.5);
doc.text("Chargeable\nWeight", marginLeft + 61, currentY + 1.8);
doc.text("Rate\nCharge", marginLeft + 83, currentY + 1.8);
doc.text("Total", marginLeft + 110, currentY + 2.8);
doc.text(
  "Nature and Quantity of Goods \n (incl. Dimensions or Volume)",
  marginLeft + 145,
  currentY + 2.8
);


// --------------------------
// 6. DATA ROW
// --------------------------
doc.setFontSize(8);

// how much you want to move right (try 10 first so you clearly see it)
const offsetX = 10; 

doc.text(String(awbData.item.pieces),               marginLeft - 5  + offsetX, hLineTable1Y + 5);
doc.text((awbData.item.grossWeight || 0).toFixed(2), marginLeft + 8 + offsetX, hLineTable1Y + 5);

doc.text(awbData.item.kgLbIndicator, marginLeft + 31.5, hLineTable1Y + 5); // kg Lb
doc.text(awbData.item.rateClass, marginLeft + 26.8 + offsetX, hLineTable1Y + 5); //Rate Class


doc.text((awbData.item.chargeableWeight || 0).toFixed(2), marginLeft + 49 + 2+ offsetX, hLineTable1Y + 5);
doc.text((awbData.item.rateCharge || 0).toFixed(2),       marginLeft + 76 - 2 + offsetX, hLineTable1Y + 5);
doc.text((awbData.item.totalCharge || 0).toFixed(2),      marginLeft + 89 + 9 + offsetX, hLineTable1Y + 5); // upper 5964.96 text




// --------------------------
// 7. NATURE OF GOODS BOX
// --------------------------
// Draw nature of goods (original position)
drawMultilineInBox(
  marginLeft + 132,
  hLineTable1Y + 1,
  pageWidth - 107,
  tableRowHeight - 10,
  awbData.natureOfGoods,
  7,
  1
);

// Draw House No line separately (moved downward)
doc.setFontSize(7);
doc.text(
  awbData.goodsRouting,
  marginLeft + 132,
  hLineTable1Y + 50  // <-- adjust THIS number to move House No up/down
);


// --------------------------
// 8. TOTALS (bottom row)
// --------------------------
// doc.setFontSize(6);
// doc.text("Weight Charge", marginLeft + 13, hLineTotalY + 3);
// doc.text("Valuation Charge", marginLeft + 33, hLineTotalY + 3);
// doc.text("Tax", marginLeft + 43, hLineTotalY + 3);
// doc.text("Other Charges", marginLeft + 54, hLineTotalY + 3);

doc.setFontSize(8);

// Bottom Pieces → move right
doc.text(
  String(awbData.item.pieces),
  marginLeft - 5 + 10,   // = marginLeft + 5
  hLineTotalY + 7
);

// Bottom Gross Weight → move right
doc.text(
  (awbData.item.grossWeight || 0).toFixed(2),
  marginLeft + 8 + 10,   // = marginLeft + 18
  hLineTotalY + 7
);

// Bottom Total Charge → move right
doc.text(
  (awbData.item.totalCharge || 0).toFixed(2),
  marginLeft + 89 + 9 + 10,  // = marginLeft + 108
  hLineTotalY + 7
);


currentY += tableRowHeight;



    // ------------------ ROW 8: TOTALS / CERTIFICATION (stretch to footer) ------------------

    
    // compute available height from currentY to footer area
    let chargeRowHeight = Math.max(45, footerY - 10 - currentY); // ensure minimum
    doc.rect(marginLeft, currentY, pageWidth, chargeRowHeight, "S");

    // vertical splits inside totals/cert region
    const vLineLeftSplit = marginLeft + 20.0;
    const vLineMiddleSplit = marginLeft + 40.0;
    const vLineCertSplit = marginLeft + 80.0;
    



    // doc.line(vLineLeftSplit, currentY, vLineLeftSplit, currentY + chargeRowHeight);
    // doc.line(vLineMiddleSplit, currentY, vLineMiddleSplit, currentY + chargeRowHeight);
    doc.line(vLineCertSplit, currentY, vLineCertSplit, currentY + chargeRowHeight);

    

    // horizontal splits (left side small rows)
    const hLinesLeft = [currentY + 8.0, currentY + 18.0, currentY + 26.0];
    hLinesLeft.forEach((y) => doc.line(marginLeft, y, vLineCertSplit, y));
   
const gap = 8; // reduce height of each row (default was 10)

//below section L type line adjest form here
// Small shift for the L-shaped separator near the right side
const lShiftX = 6.0; // mm to move right
const lShiftY = 4.0; // mm to move down

doc.line(
  marginLeft,
  hLinesLeft[2] + lShiftY - 4, // 8th coloum right side diving line adjust frmoe here - 4 or -3
  vLineCertSplit + 104+ lShiftX,
  hLinesLeft[2] + lShiftY-4     // 8th coloum right side diving line adjust frmoe here - 4 or -3
);
doc.line(
  vLineCertSplit + 33 + lShiftX,                 // X-position (end of horizontal line)
  currentY + 8.8 + gap*7 + lShiftY ,               // Y-start
  vLineCertSplit + 33 + lShiftX,                 // X-position stays same
  currentY + 8.8 + gap*7 + 8.5 + lShiftY           // Y-end (adjusted down) increse height +8 +9...
);

doc.line(marginLeft, currentY + 10 + gap*3, vLineCertSplit, currentY + 10 + gap*3);
doc.line(marginLeft, currentY + 11 + gap*4, vLineCertSplit, currentY + 11 + gap*4);
doc.line(marginLeft, currentY + 11 + gap*5, vLineCertSplit, currentY + 11 + gap*5);
doc.line(marginLeft, currentY + 12 + gap*6, vLineCertSplit, currentY + 12 + gap*6);
//below 2nd last horizontal line code 
doc.line(
  marginLeft,
  currentY + 9 + gap*7 + lShiftY,
  vLineCertSplit + 33 + lShiftX,
  currentY + 9 + gap*7 + lShiftY
);



    // Left column labels & data
    doc.setFontSize(5);
    doc.text("Prepaid", marginLeft + 10, currentY + 2.5);
    doc.text("Weight Charge", marginLeft + 33, currentY + 2.5);
    doc.text("Collect", marginLeft + 60, currentY + 2.5);
   doc.setFont("helvetica", "bold");  
doc.text("Other Charges", marginLeft + 81, hLinesLeft[0] - 5); 
doc.setFont("helvetica", "normal");  // reset back to normal

    doc.text("Valuation Charge", marginLeft + 33, hLinesLeft[0] + 2.5);
    doc.text("Tax", marginLeft + 38, hLinesLeft[0] + 12);
    doc.text("TOTAL OTHER CHARGES DUE AGENT", marginLeft + 26, hLinesLeft[1] + 10);
    doc.text("TOTAL OTHER CHARGES DUE CARRIER", marginLeft + 26, hLinesLeft[1] + 18);
    doc.text("AWC:10", marginLeft + 82, hLinesLeft[2] -13);
    doc.text("TOTAL PREPAID", marginLeft + 15, hLinesLeft[2] + 27);
    doc.text("TOTAL COLLECT", marginLeft + 49, hLinesLeft[2] + 27);


  

    doc.text("Currency Conversion Rates", marginLeft + 7.0, hLinesLeft[2] + 36.4);
    doc.text("CC Charges in Dest Currency", vLineLeftSplit + 26, hLinesLeft[2] + 36.4);
    // doc.text("For Carrier's Use only at Destination", vLineMiddleSplit + 1.7, hLinesLeft[2] + 22);
    // doc.text("Charges at Destination", vLineCertSplit + 1.7, hLinesLeft[2] + 20);

    doc.setFontSize(7);
    doc.text((awbData.item.totalCharge || 0).toFixed(2), vLineLeftSplit - 1.5, currentY + 6.5, { align: "right" }); // Prepaid
    doc.text("", vLineLeftSplit - 1.5, currentY + 8, { align: "right" }); // Weight Charge (empty)
    // 🔹 Draw a U-shaped frame (two vertical + one bottom horizontal)
function drawUShape(doc, startX, startY, height, width) {
  // Left vertical line
  doc.line(startX, startY, startX, startY + height);

  // Right vertical line
  doc.line(startX + width, startY, startX + width, startY + height);

  // Bottom horizontal line
  doc.line(startX, startY + height, startX + width, startY + height);
}

    doc.text("", vLineLeftSplit - 1.5, currentY + 13, { align: "right" }); // Collect (empty)
    doc.text("", vLineLeftSplit - 1.5, hLinesLeft[0] + 3.5, { align: "right" }); // Other Charges (empty)
    doc.text("", vLineLeftSplit - 1.5, hLinesLeft[0] + 8, { align: "right" }); // Valuation Charge (empty)
    doc.text("", vLineLeftSplit - 1.5, hLinesLeft[0] + 13, { align: "right" }); // Tax (empty)
    doc.text("", vLineLeftSplit - 1.5, hLinesLeft[1] - 4.2, { align: "right" }); // Total Other Charges Due Agent (empty)
    doc.text(awbData.otherChargesDueCarrier.toFixed(2), vLineLeftSplit - 1.5, hLinesLeft[1] + 20.5, { align: "right" }); // Total Other Charges Due Carrier
    doc.text((awbData.totalPrepaid || 0).toFixed(2), vLineLeftSplit - 1.5, hLinesLeft[2] + 31.0, { align: "right" }); // Total Prepaid
    doc.text((awbData.totalCollect || 0).toFixed(2), vLineLeftSplit - 1.5, hLinesLeft[2] + 3.5, { align: "right" }); // Total Collect

  // 🔹 Reusable U-Shape Drawer
function drawUShape(startX, startY, width, height) {
  // Left vertical
  doc.line(startX, startY, startX, startY + height);

  // Right vertical
  doc.line(startX + width, startY, startX + width, startY + height);

  // Bottom horizontal
  doc.line(startX, startY + height, startX + width, startY + height);
}


drawUShape(marginLeft + 29, hLinesLeft[1] - 18, 20, 3.5);
drawUShape(marginLeft + 4, hLinesLeft[1] - 18, 20, 3.5);
drawUShape(marginLeft + 53, hLinesLeft[1] - 18, 20, 3.5);



drawUShape(marginLeft + 30, hLinesLeft[0], 20, 3.5);

drawUShape(marginLeft + 33, hLinesLeft[0] + 10, 15, 3.5);

drawUShape(vLineLeftSplit + 2, currentY +  26, 40, 3.5);

drawUShape(vLineLeftSplit + 2, currentY +  34, 40, 3.5);

drawUShape(vLineLeftSplit - 12, hLinesLeft[2] + 25, 30, 3.5);

drawUShape(vLineLeftSplit +23, hLinesLeft[2] + 31 - 6, 30, 3.5);

drawUShape(vLineLeftSplit - 15, hLinesLeft[2] + 34, 33, 3.5);

drawUShape(vLineLeftSplit - 12, hLinesLeft[2] + 25, 30, 3.5);

drawUShape(vLineLeftSplit +23, hLinesLeft[2] + 31 - 6, 30, 3.5);

drawUShape(vLineLeftSplit +23, hLinesLeft[2] + 34, 33, 3.5);

drawUShape(vLineLeftSplit +23, hLinesLeft[2] + 43.2, 33, 3.5);


// code for vertical line 

function drawSmallVLine(doc, startX, startY, height) {
  doc.line(startX, startY, startX, startY + height);
}

drawSmallVLine(doc, vLineLeftSplit + 20, hLinesLeft[1] -14.5, 4.5); //first small vertical line
drawSmallVLine(doc, vLineLeftSplit + 20, hLinesLeft[1] - 6.5, 6.5); //second small vertical line
drawSmallVLine(doc, vLineLeftSplit + 20, hLinesLeft[1] +3.5, 4.5);  //third small vertical line
drawSmallVLine(doc, vLineLeftSplit + 20, hLinesLeft[1] +11.5, 4.5); //fourth small vertical line
drawSmallVLine(doc, vLineLeftSplit + 20, hLinesLeft[1] +19.5, 39.6);//fifth to last small vertical line


    // certification paragraph (right area)
    doc.setFontSize(5);
    const certText =
      "Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to all applicable international and national regulations.";
    drawMultilineInBox(vLineCertSplit + 1.2, currentY + 21, marginLeft + pageWidth - vLineCertSplit - 1.8, chargeRowHeight - 14, certText, 6, 1.2);
    
    // Date / executed at
    doc.setFontSize(6);
    doc.text("Executed on (Date):", vLineCertSplit + 1.2, hLinesLeft[2] + 41);
    doc.text("at (Place):", vLineCertSplit + 37, hLinesLeft[2] + 41);
    
    //date & input data section
    doc.setFontSize(7);
    doc.text(awbData.date, vLineCertSplit + 1.2, hLinesLeft[2] + 36);
    doc.text(awbData.executedAt, vLineCertSplit + 34, hLinesLeft[2] + 36); 

     // Certified note + simulated stamp & signature area
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ONEGLOBE LOGISTICS", vLineCertSplit + 35, currentY + 47);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    doc.text("Signature of Shipper or his Agent", vLineCertSplit + 42, currentY + 50);

    // Certified note + simulated stamp & signature area
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("CERTIFIED NON DG BASED ON SHIPPER DECLARATION", vLineCertSplit + 20, currentY + 53);

    

const finalBoxY = currentY + chargeRowHeight - 15.0;

// Ensure font is NOT bold
doc.setFont("helvetica", "normal");
doc.setFontSize(6);

// Add: For Carrier's Use only at Destination
doc.text(
  "For Carrier's Use only \n at Destination",
  marginLeft + 12,
  finalBoxY + 10
);

// Add: Charges at Destination
doc.text(
  "Charges at Destination",
  marginLeft + 49,
  finalBoxY + 10
);




// Move signature further right (towards the corner)
const sigX = vLineCertSplit + 85;   // earlier was +55
const sigY = currentY + chargeRowHeight - 16;

// Signature Name
doc.setFontSize(7);
doc.text(awbData.signatureName, sigX, sigY);

// ----- DOTTED LINE (just above text) -----
doc.setLineWidth(0.1);
doc.setLineDash([1, 1], 0);  // dotted
doc.line(sigX - 84, sigY + 4, sigX + 25, sigY + 4); // adjust width as needed
doc.setLineDash(); // reset

// Signature label (moved right)
doc.setFontSize(6);
doc.text(
  "Signature of Issuing Carrier or Its Agent",
  sigX - 20,
  sigY + 8
);

    // // execution box bottom-left separators
    // const finalBoxY = currentY + chargeRowHeight - 15.0;
    // doc.line(marginLeft, finalBoxY, vLineCertSplit, finalBoxY);
    
    // doc.line(vLineLeftSplit, finalBoxY, vLineLeftSplit, currentY + chargeRowHeight);
    // doc.line(vLineMiddleSplit, finalBoxY, vLineMiddleSplit, currentY + chargeRowHeight);

    doc.setFontSize(6);
    // drawMultilineInBox(marginLeft + 1.2, finalBoxY + 2.5, vLineLeftSplit - marginLeft - 3, 12, "For Carrier's Use only\n at Destination", 6, 1);
    // doc.text("Charges at Destination", vLineLeftSplit + 1.2, finalBoxY + 4.8);

   // Footer centered text and AWB right
const footerTextY = footerY - 5; // <-- adjust height here


// Add Total Collect Charges in bottom right
doc.setFontSize(6);
doc.text(
  "Total Collect Charges",
  vLineCertSplit + 11,   // move left/right
  finalBoxY + 11         // move up/down
);

doc.setTextColor(0, 0, 0);     
doc.setFont("helvetica", "bold");

doc.setFontSize(7);
doc.text("ORIGINAL 3 (FOR SHIPPER)", marginLeft + pageWidth / 2, footerTextY, { align: "center" });

doc.setFontSize(10);
doc.text(`${awbData.awbPrefix} - ${awbData.awbNumber}`, marginLeft + 165, footerTextY);





    // Convert PDF to buffer & send
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=air-waybill-replicate.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ----- START SERVER -----
const PORT = 3080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
