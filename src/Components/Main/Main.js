import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";

import "./main.css";

const Main = () => {
  const [canvas, setCanvas] = useState("");
  const [imgURL, setImgURL] = useState("");
  const [canvasSize, setCanvasSize] = useState({
    height: 10,
    width: 20,
  });
  const [backgroundColor, setBackgroundColor] = useState(`#000`);

  const colorInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const can = new fabric.Canvas(canvasRef.current, {
      backgroundColor,
      height: canvasSize.height * 37.795275591,
      width: canvasSize.width * 37.795275591,
      preserveObjectStacking: true,
    });
    setCanvas(can);

    const handleKeyDown = (event) => {
      if (event.key === "Delete") {
        removeSelectedObject(can);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      can.dispose();
    };
  }, [backgroundColor, canvasSize.height, canvasSize.width]);

  const addRectangle = (canvas) => {
    const rect = new fabric.Rect({
      height: 280,
      width: 200,
      fill: "yellow",
    });
    canvas.add(rect);
    canvas.renderAll();
  };

  const download = () => {
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
  };
  const saveJsonTemplate = () => {
    const canvasJSON = canvas.toJSON();
    console.log("Fabric.js Canvas JSON:", canvasJSON);
  };

  const addText = () => {
    const newText = new fabric.IText("Id: ", {
      left: 300,
      top: 200,
      fill: "green",
    });
    canvas.add(newText);
  };

  const addImg = () => {
    new fabric.Image.fromURL(
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example",
      (img) => {
        canvas.add(img);
        canvas.renderAll();
        setImgURL("");
      },
      { crossOrigin: "*" }
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target.result;

        fabric.Image.fromURL(imageUrl, (img) => {
          canvas.add(img);
          canvas.renderAll();
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = () => {
    const selectedColor = colorInputRef.current.value;
    setBackgroundColor(selectedColor);
  };

  const removeSelectedObject = (canvas) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.remove(selectedObject);
    }
  };

  const moveObjectForward = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.bringForward(selectedObject);
    }
  };

  const moveObjectBackward = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.sendBackwards(selectedObject);
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
          <button onClick={saveJsonTemplate}>Download Json</button>
        </div>
      </div>
      <div className="editor">
        <div className="tools">
          <button onClick={() => addRectangle(canvas)}>Add rect</button>
          <button onClick={addText}>Add Text</button>
          <input
            type="color"
            id="colorInput"
            ref={colorInputRef}
            defaultValue={backgroundColor}
            onChange={handleColorChange}
          />
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
          <button onClick={addImg}>Add Img</button>
        </div>
        <div className="canvas-screen">
          <canvas id="canvas" ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default Main;
