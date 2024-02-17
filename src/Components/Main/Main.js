import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";
import QRious from "qrious";

import "./main.css";
import back from "./../../assets/vecteezy_transparent-background-4k-empty-grid-checkered-layout-wallpaper_21736279.jpg";

const fonts = ["serif", "sans-serif", "monospace"];

const Main = () => {
  const [canvas, setCanvas] = useState("");
  const [imgURL, setImgURL] = useState("");
  const [sizeOfQr, setSizeOfQr] = useState(200);
  const [canvasSize, setCanvasSize] = useState({
    height: 13,
    width: 25,
  });
  const [backgroundColor, setBackgroundColor] = useState(null);

  const [isTextSelected, setIsTextSelected] = useState(false);

  const colorInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const can = new fabric.Canvas(canvasRef.current, {
      backgroundColor,
      height: canvasSize.height * 37.795275591,
      width: canvasSize.width * 37.795275591,
      preserveObjectStacking: true,
    });
    can.renderAll.bind(can)();

    // CHANGE BACKGROUND IMAGE IN CANVAS
    fabric.Image.fromURL(back, (img) => {
      img.set({ excludeFromExport: true });
      can.setBackgroundImage(img, can.renderAll.bind(can), {
        scaleX: can.width / img.width,
        scaleY: can.height / img.height,
      });
    });
    setCanvas(can);
    //DELETE ELEMENT FROM CANVAS
    const handleKeyDown = (event) => {
      if (event.key === "Delete") {
        removeSelectedObject(can);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // const handleObjectSelected = (event) => {
    //   console.log(event);
    //   if (event.selected[0].text) {
    //     setIsTextSelected(true);
    //   } else {
    //     setIsTextSelected(false);
    //   }
    // };

    // can.on("selection:created", handleObjectSelected);
    // can.on("selection:updated", handleObjectSelected);

    return () => {
      can.dispose();
    };
  }, [backgroundColor, canvasSize.height, canvasSize.width]);

  // FILE SAVE FUNCTIONS
  const download = () => {
    try {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
      const dataUrl = canvas.toDataURL({
        width: canvas.width,
        height: canvas.height,
        left: 0,
        top: 0,
        format: "png",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "canvas_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      fabric.Image.fromURL(back, (img) => {
        img.set({ excludeFromExport: true });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        });
      });
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const saveJsonTemplate = () => {
    try {
      const canvasJSON = canvas.toJSON(["subType", "qrSize"]);
      console.log("Fabric.js Canvas JSON:", canvasJSON);

      canvasJSON.canvasSize = {
        height: canvasSize.height * 37.795275591,
        width: canvasSize.width * 37.795275591,
      };

      const blob = new Blob([JSON.stringify(canvasJSON)], {
        type: "application/json",
      });

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "fabric-canvas.json";

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };

  // FILE LOAD
  const handleTemplateUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const jsonString = e.target.result;
        loadFromJsonFile(jsonString);
      };

      reader.readAsText(file);
    }
  };
  const loadFromJsonFile = (jsonString) => {
    canvas.loadFromJSON(jsonString, () => {
      canvas.renderAll();
    });
  };

  // ADD OBJECTS AND TEXTS
  const addRectangle = (canvas) => {
    try {
      const rect = new fabric.Rect({
        height: 280,
        width: 200,
        fill: "white",
        subType: "Rectangle",
      });
      canvas.add(rect);
      canvas.renderAll();
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const addText = () => {
    try {
      const newText = new fabric.Textbox("type your text...", {
        left: 300,
        top: 200,
        width: 262,
        subType: "CustomText",
      });

      canvas.add(newText);
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const addIdPin = (str) => {
    try {
      const text = new fabric.Textbox(str, {
        left: 300,
        top: 200,
        subType: str,
      });

      canvas.add(text);

      canvas.renderAll();
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const addImg = () => {
    try {
      // new fabric.Image.fromURL(
      //   "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example",
      //   (img) => {
      //     canvas.add(img);
      //     canvas.renderAll();
      //     setImgURL("");
      //   },
      //   { crossOrigin: "*" }
      // );

      // Generate QR code using QRious
      const qr = new QRious({
        size: sizeOfQr,
        value: "https://github.com/neocotic/qrious",
      });

      // Create a Fabric.js image object with the QR code data URL
      fabric.Image.fromURL(qr.toDataURL(), (img) => {
        // Set the position and size of the QR code on the canvas
        img.set({
          left: 50,
          top: 50,
          subType: "qr",
          qrSize: sizeOfQr,
        });

        // Add the QR code image to the canvas
        canvas.add(img);
        canvas.renderAll();
      });
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };

  // ADD AND REMOVE HANDLER
  const handleImageUpload = (event) => {
    try {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const imageUrl = e.target.result;

          fabric.Image.fromURL(imageUrl, (img) => {
            img.set({ subType: "BaseImage" });
            canvas.add(img);
            canvas.renderAll();
          });
        };

        reader.readAsDataURL(file);
      }
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const removeSelectedObject = (canvas) => {
    try {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject) {
        canvas.remove(selectedObject);
      }
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };

  // z-index change
  const moveObjectForward = () => {
    try {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject) {
        canvas.bringForward(selectedObject);
      }
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };
  const moveObjectBackward = () => {
    try {
      const selectedObject = canvas.getActiveObject();
      if (selectedObject) {
        canvas.sendBackwards(selectedObject);
      }
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };

  // text changes
  const handleTextChange = (event, action) => {
    try {
      const selectedObject = canvas.getActiveObject();
      if (action === "font") {
        if (selectedObject) {
          const newFontFamily = event.target.value;
          selectedObject.set({ fontFamily: newFontFamily });
        }
      } else if (action === "bold") {
        if (selectedObject) {
          const isBold =
            !selectedObject.get("fontWeight") ||
            selectedObject.get("fontWeight") === "normal";

          console.log(isBold);
          selectedObject.set({ fontWeight: isBold ? "bold" : "normal" });
        }
      }
      canvas.renderAll();
    } catch (err) {
      alert(err.message);
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="other-tools">
        <div className="layer">
          <button onClick={moveObjectForward}>Move Forward</button>
          <button onClick={moveObjectBackward}>Move Backward</button>
        </div>
        <div className="file-save">
          <button onClick={download}>Download</button>
          <input
            type="file"
            accept=".json"
            onChange={handleTemplateUpload}
            placeholder="Upload Template"
          />
          <button onClick={saveJsonTemplate}>Download Template</button>
        </div>
      </div>

      <div className="text-tools">
        <label>
          Font:
          <select onChange={(e) => handleTextChange(e, "font")}>
            {fonts.map((curr, i) => {
              return (
                <option value={curr} key={i}>
                  {curr}
                </option>
              );
            })}
          </select>
        </label>

        <label>
          Size:
          <input type="number" />
        </label>

        <button onClick={(e) => handleTextChange(e, "bold")}>Bold</button>
      </div>

      <div className="editor">
        <div className="tools">
          <button onClick={() => addRectangle(canvas)}>Add rect</button>
          <button onClick={() => addIdPin("[ID]")}>Add ID</button>
          <button onClick={() => addIdPin("[PIN]")}>Add PIN</button>
          <button onClick={addText}>Add Text</button>

          <label>
            Height (in cm)
            <input
              type="number"
              min={0}
              value={canvasSize.height}
              onChange={(e) => {
                setCanvasSize((curr) => {
                  return {
                    ...curr,
                    height: Number(e.target.value),
                  };
                });
              }}
            />
          </label>
          <label>
            Width (in cm)
            <input
              type="number"
              min={0}
              value={canvasSize.width}
              onChange={(e) => {
                setCanvasSize((curr) => {
                  return {
                    ...curr,
                    width: Number(e.target.value),
                  };
                });
              }}
            />
          </label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <div>
            <input
              type="number"
              onChange={(e) => setSizeOfQr(Number(e.target.value))}
              placeholder="Enter size of qr"
            />
            <button onClick={addImg}>Add Qr</button>
          </div>
        </div>
        <div className="canvas-screen">
          <canvas id="canvas" ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default Main;
