import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportData {
  name: string;
  category: string;
  starRating: number;
  address: string;
  city: string;
  country: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  rooms: {
    singleRooms: number;
    doubleRooms: number;
    suites: number;
    connectingRooms: number;
    features: string;
  };
  facilities?: string[];
  events: {
    spaces: number;
    maxCapacity: number;
    equipment: boolean;
    coordinator: string;
  };
  fnb: {
    restaurants: number;
    bars: number;
    roomService: boolean;
    contact: string;
  };
  images?: {
    type: string;
    url: string;
    title: string;
  }[];
  documents?: {
    type: string;
    name: string;
    size: string;
  }[];
}

// Add jsPDF types extension for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const exportToPDF = async (data: ExportData) => {
  try {
    // Create a new PDF document with company branding colors
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }) as jsPDF & { autoTable: Function };
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 20;
    
    // Add header with elegant styling
    // Create colored header
    doc.setFillColor(42, 53, 71); // Dark blue header
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Add white text for the title
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.name, pageWidth / 2, 15, { align: 'center' });
    
    // Reset text color for the rest of the document
    doc.setTextColor(0, 0, 0);
    
    // If there's an image, add it next to the hotel info
    if (data.images && data.images.length > 0) {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";  // Avoid CORS issues
        
        // Create a promise to wait for the image to load
        const loadImagePromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = data.images[0].url;
        });
        
        // Wait for the image to load
        await loadImagePromise;
        
        // Calculate image dimensions to fit within a reasonable space
        const imgWidth = 70;  // Width in mm
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Add the image to the right side
        doc.addImage(img, 'JPEG', pageWidth - margin - imgWidth, 30, imgWidth, imgHeight);
        
        // Adjust text width to make room for the image
        y = 35;
      } catch (err) {
        console.error("Error loading image:", err);
        // Continue without the image
        y = 35;
      }
    } else {
      y = 35;
    }
    
    // Category and Rating
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const ratingText = `Category: ${data.category} | Rating: ${data.starRating === 0 ? 'Not Classified' : '★'.repeat(data.starRating)}`;
    doc.text(ratingText, margin, y);
    y += 10;
    
    // CONTACT INFORMATION
    doc.setFillColor(240, 240, 240); // Light gray background
    doc.rect(margin, y, contentWidth / 2 - 5, 40, 'F');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT INFORMATION", margin + 5, y + 7);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Address: ${data.address}`, margin + 5, y + 5);
    doc.text(`City: ${data.city}, ${data.country}`, margin + 5, y + 12);
    doc.text(`Contact: ${data.contactName}`, margin + 5, y + 19);
    doc.text(`Phone: ${data.contactPhone}`, margin + 5, y + 26);
    
    // DESCRIPTION
    y += 45;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", margin, y);
    y += 5;
    
    doc.setDrawColor(200, 200, 200); // Light gray line
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 30, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(data.description, contentWidth);
    doc.text(descriptionLines, margin, y);
    y += descriptionLines.length * 5 + 10;
    
    // Add new page if we're running out of space
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }
    
    // ACCOMMODATION - Create a table for better layout
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOMMODATION", margin, y);
    y += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 8;
    
    // Create table for rooms data
    const roomsBody = [
      ["Single Rooms", data.rooms.singleRooms.toString()],
      ["Double Rooms", data.rooms.doubleRooms.toString()],
      ["Suites", data.rooms.suites.toString()],
      ["Connecting Rooms", data.rooms.connectingRooms.toString()],
      ["Room Features", data.rooms.features || 'N/A']
    ];
    
    // Using doc.autoTable directly
    (doc as any).autoTable({
      startY: y,
      head: [['Room Type', 'Count/Details']],
      body: roomsBody,
      margin: { left: margin },
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    // Add new page if we're running out of space
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    
    // FACILITIES
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FACILITIES", margin, y);
    y += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 30, y);
    y += 8;
    
    // Create table for facilities
    if (data.facilities && data.facilities.length > 0) {
      // Arrange facilities in rows of 3 for better layout
      let facilitiesRows = [];
      for (let i = 0; i < data.facilities.length; i += 3) {
        const row = [
          data.facilities[i] || '',
          data.facilities[i+1] || '',
          data.facilities[i+2] || ''
        ];
        facilitiesRows.push(row);
      }
      
      (doc as any).autoTable({
        startY: y,
        body: facilitiesRows,
        margin: { left: margin },
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4 },
        tableWidth: contentWidth
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No facilities listed", margin, y);
      y += 10;
    }
    
    // Add new page if we're running out of space
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }
    
    // EVENT SPACES
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EVENT SPACES", margin, y);
    y += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 35, y);
    y += 8;
    
    // Create table for event spaces
    const eventsBody = [
      ["Number of Spaces", data.events.spaces.toString()],
      ["Maximum Capacity", `${data.events.maxCapacity} people`],
      ["AV Equipment", data.events.equipment ? 'Available' : 'Not Available'],
      ["Event Coordinator", data.events.coordinator || 'N/A']
    ];
    
    (doc as any).autoTable({
      startY: y,
      body: eventsBody,
      margin: { left: margin },
      theme: 'grid',
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    // FOOD & BEVERAGE
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FOOD & BEVERAGE", margin, y);
    y += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 8;
    
    // Create table for F&B
    const fnbBody = [
      ["Restaurants", data.fnb.restaurants.toString()],
      ["Bars", data.fnb.bars.toString()],
      ["Room Service", data.fnb.roomService ? 'Available' : 'Not Available'],
      ["F&B Contact", data.fnb.contact || 'N/A']
    ];
    
    (doc as any).autoTable({
      startY: y,
      body: fnbBody,
      margin: { left: margin },
      theme: 'grid',
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
    
    // Add footer with page number
    // Fix for totalPages calculation
    const pageCount = doc.internal.pages.length;
    const totalPages = pageCount === 1 ? 1 : pageCount - 1;
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${totalPages} - ${data.name} - Generated on ${new Date().toLocaleDateString()}`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`${data.name.replace(/\s+/g, '_')}_Details.pdf`);
    console.log("PDF generation completed successfully");
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const exportToCSV = (data: ExportData) => {
  const headers = "Name,Category,Rating,Address,City,Country,Contact Name,Phone,Email,Single Rooms,Double Rooms,Suites,Connecting Rooms,Room Features,Event Spaces,Max Capacity,Restaurants,Bars\n";
  
  const values = [
    data.name,
    data.category,
    data.starRating,
    data.address,
    data.city,
    data.country,
    data.contactName,
    data.contactPhone,
    data.contactEmail,
    data.rooms.singleRooms || 0,
    data.rooms.doubleRooms || 0,
    data.rooms.suites || 0,
    data.rooms.connectingRooms || 0,
    `"${data.rooms.features || ''}"`,
    data.events.spaces || 0,
    data.events.maxCapacity || 0,
    data.fnb.restaurants || 0,
    data.fnb.bars || 0
  ].join(',');

  const csvContent = headers + values;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.name.replace(/\s+/g, '_')}_Details.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.name.replace(/\s+/g, '_')}_Details.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
