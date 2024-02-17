import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import * as XLSX from "xlsx";
import QRious from "qrious";
import JSZip from "jszip";

import { CONSTANTS } from "../extra/Extra";

import "./gen.css";

const Generator = () => {
  const [excelData, setExcelData] = useState([]);
  const [jsonTemplate, setJsonTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [canSize, setCanSize] = useState({ width: 700, height: 700 });
  const [can, setCan] = useState();

  const canvasRef = useRef(null);

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    setCan(new fabric.Canvas(canvasRef.current));
  }, []);

  // FILE LOAD
  const handleTemplateUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const jsonString = e.target.result;
        setJsonTemplate(jsonString);
      };

      reader.readAsText(file);
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        setExcelData(excelData);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // GENERATE
  const generateSticker = async () => {
    try {
      if (excelData.length < 1 || !jsonTemplate) {
        alert("Add Both the files");
        return;
      }

      setLoading(true);

      const objects = JSON.parse(jsonTemplate);

      setCanSize({
        height: Number(objects.canvasSize.height),
        width: Number(objects.canvasSize.width),
      });

      const zip = new JSZip();

      for (let i = 0; i < excelData.length; i++) {
        const currQr = excelData[i];

        objects.objects.forEach((curr) => {
          if (curr["subType"] === CONSTANTS.id) {
            curr.text = currQr.id;
          }
          if (curr["subType"] === CONSTANTS.pin) {
            curr.text = currQr.pin;
          }
          if (curr["subType"] === CONSTANTS.qr) {
            const qr = new QRious({
              size: curr.qrSize || 150,
              value: currQr.url,
            });

            const base64QRimage = qr.toDataURL();

            curr.src = base64QRimage;
          }
        });

        const jsonToRender = JSON.stringify(objects);

        await new Promise((resolve) => {
          can.loadFromJSON(jsonToRender, () => {
            can.renderAll();

            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL({ format: "png" });

            const fileName = `qr_${i + 1}.png`;
            zip.file(fileName, dataURL.split(",")[1], { base64: true });

            resolve();
          });
        });
      }

      const content = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "canvas_images.zip";
      link.click();
      setLoading(false);
    } catch (error) {
      console.error("Error in generateSticker:", error);
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      if (excelData.length < 1 || !jsonTemplate) {
        alert("Add Both the files");
        return;
      }

      setLoading(true);

      const objects = JSON.parse(jsonTemplate);

      setCanSize({
        height: Number(objects.canvasSize.height),
        width: Number(objects.canvasSize.width),
      });

      const currQr = excelData[0];

      objects.objects.forEach((curr) => {
        if (curr["subType"] === CONSTANTS.id) {
          curr.text = currQr.id;
        }
        if (curr["subType"] === CONSTANTS.pin) {
          curr.text = currQr.pin;
        }
        if (curr["subType"] === CONSTANTS.qr) {
          const qr = new QRious({
            size: curr.qrSize || 150,
            value: currQr.url,
          });

          const base64QRimage = qr.toDataURL();

          curr.src = base64QRimage;
        }
      });

      const jsonToRender = JSON.stringify(objects);

      await new Promise((resolve) => {
        can.loadFromJSON(jsonToRender, () => {
          can.renderAll();

          const canvas = canvasRef.current;
          const dataURL = canvas.toDataURL({ format: "png" });

          setPreviewImage(dataURL);
          openModal();
          setLoading(false);

          resolve();
        });
      });
    } catch (error) {
      console.error("Error in generateSticker:", error);
      setLoading(false);
    }
  };
  return (
    <div className="generator">
      <div className="files-up">
        <div className="excel-reader">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

          {excelData.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(excelData[0]).map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="template">
          <input type="file" accept=".json" onChange={handleTemplateUpload} />
        </div>
      </div>

      {modalIsOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <img src={previewImage} alt="Sticker Preview" />
            <button onClick={closeModal}>Close Preview</button>
          </div>
        </div>
      )}

      <button disabled={loading} onClick={() => generatePreview()}>
        SHOW PREVIEW
      </button>
      <button disabled={loading} onClick={() => generateSticker()}>
        GENERATE ALL
      </button>

      <canvas
        className="none"
        width={canSize.width}
        height={canSize.height}
        ref={canvasRef}
      ></canvas>
    </div>
  );
};

export default Generator;
