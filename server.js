// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { jsPDF } = require("jspdf");
const app = express();

app.use(bodyParser.json());

// ----- ROUTE: Generate Air Waybill PDF -----
app.get("/generate-pdf", async (req, res) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set font
    doc.setFont("helvetica");

    // Starting positions
    const startX = 10;
    const startY = 10;
    const pageWidth = 190; // A4 width minus margins

    // Box dimensions
    const leftBoxWidth = pageWidth * 0.5;
    const rightBoxWidth = pageWidth * 0.5;
    const rowHeight = 25;

    let currentY = startY;

    // Draw outer border
    doc.setLineWidth(0.3);
    doc.rect(startX, startY, pageWidth, rowHeight * 4);

    // === FIRST ROW: Shipper's Name & Address ===
    // Left box
    doc.setFontSize(5);
    doc.text("SHIPPER'S NAME & ADDRESS", startX + 2, currentY + 2.5);

    // Light gray section background (#dcdcdc)
    doc.setFillColor(220, 220, 220);

    // Draw a filled rectangle for the section With gray
    // Syntax: rect(x, y, width, height, style)
    doc.rect(55, 10.2, 50, 7, "F"); // “F” = fill only
    doc.text("SHIPPER'S ACCOUNT NUMBER", startX + 57, currentY + 2.5);
    // Horizontal line
    doc.line(55 + 50, -8 + rowHeight, 5 + 50, -8 + rowHeight);
    // Vertical line to separate (removed for single box)
    doc.line(1 + 54, currentY, 1 + 54, currentY + 7);

    // Vertical line to separate (removed for single box)
    doc.line(
      startX + leftBoxWidth,
      currentY,
      startX + leftBoxWidth,
      currentY + rowHeight
    );

    // Horizontal line
    doc.line(
      startX,
      currentY + rowHeight,
      startX + pageWidth,
      currentY + rowHeight
    );

    currentY += rowHeight;

    // === SECOND ROW: Consignee's Name & Address and Account Number ===
    // Left box
    doc.text("CONSIGNEE'S NAME & ADDRESS", startX + 2, currentY + 2.5);


       // Draw a filled rectangle for the section With gray
    // Syntax: rect(x, y, width, height, style)
       doc.setFillColor(220, 220, 220);
    doc.rect(55, 35.2, 50, 7, "F"); // “F” = fill only
    doc.text("CONSIGNEE'S ACCOUNT NUMBER", startX + 56, currentY + 2.5);
    // Horizontal line
    doc.line(55 + 50, -8 + rowHeight + 25, 5 + 50, -8 + rowHeight + 25);
    // Vertical line to separate (removed for single box)
    doc.line(1 + 54, currentY, 1 + 54, currentY + 7);


    // Vertical line
    doc.line(
      startX + leftBoxWidth,
      currentY,
      startX + leftBoxWidth,
      currentY + rowHeight
    );

    // Right box
    doc.text(
      "CONSIGNEE'S ACCOUNT NUMBER",
      startX + leftBoxWidth + 2,
      currentY + 2.5
    );

    // Horizontal line
    doc.line(
      startX,
      currentY + rowHeight,
      startX + pageWidth,
      currentY + rowHeight
    );

    currentY += rowHeight;

    // === THIRD ROW: Issuing Carrier's Agent and Accounting Info ===
    // Left box
    doc.text(
      "ISSUING CARRIER'S AGENT NAME AND CITY :.",
      startX + 2,
      currentY + 2.5
    );

    // Vertical line
    doc.line(
      startX + leftBoxWidth,
      currentY,
      startX + leftBoxWidth,
      currentY + rowHeight
    );

    // Right box
    doc.text("Accounting Information", startX + leftBoxWidth + 2, currentY + 2.5);

    // Horizontal line
    doc.line(
      startX,
      currentY + rowHeight,
      startX + pageWidth,
      currentY + rowHeight
    );

    currentY += rowHeight;

    // === FOURTH ROW: Agent's IATA Code and Account Number ===
    const halfWidth = pageWidth / 2;

    // Left box
    doc.text("AGENT'S IATA CODE", startX + 2, currentY + 2.5);
     doc.text("ACCOUNT NO", startX + 47  , currentY + 2.5);
  
    // Horizontal line
  doc.line(100 + 5, -8 + rowHeight + 80, 5 + 5, -8 + rowHeight + 80);
      // Vertical line to separate (removed for single box)
    doc.line(1 + 54, currentY, 1 + 54, currentY + 12);

    doc.line(
      startX + halfWidth,
      currentY,
      startX + halfWidth,
      currentY + rowHeight
    );

    // Right box
    doc.text("ACCOUNT NO.", startX + halfWidth + 2, currentY + 2.5);






     // Horizontal line
    doc.line(
      startX,
      currentY + rowHeight,
      startX + pageWidth,
      currentY + rowHeight
    );

    currentY += rowHeight;

    // === THIRD ROW: Issuing Carrier's Agent and Accounting Info ===
    // Left box
    doc.text(
      "ISSUING CARRIER'S AGENT NAME AND CITY :.",
      startX + 2,
      currentY + 2.5
    );

    // Vertical line
    doc.line(
      startX + leftBoxWidth,
      currentY,
      startX + leftBoxWidth,
      currentY + rowHeight
    );

    // Right box
    doc.text("Accounting Information", startX + leftBoxWidth + 2, currentY + 2.5);

    doc.text("Accounting", startX + leftBoxWidth + 2, currentY + 2.5 + 10);

    // Horizontal line
    doc.line(
      startX,
      currentY + rowHeight,
      startX + pageWidth,
      currentY + rowHeight
    );

    doc.line(
      startX,
      currentY + 30,
      startX + pageWidth,
      currentY + rowHeight
    );

    currentY += rowHeight;

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=air-waybill-blank.pdf"
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----- START SERVER -----
const PORT = 3080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
