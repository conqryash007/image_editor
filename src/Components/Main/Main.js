import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";

import "./main.css";
import back from "./../../assets/vecteezy_transparent-background-4k-empty-grid-checkered-layout-wallpaper_21736279.jpg";

const fonts = ["serif", "sans-serif", "monospace"];

const Main = () => {
  const [canvas, setCanvas] = useState("");
  const [imgURL, setImgURL] = useState("");
  const [canvasSize, setCanvasSize] = useState({
    height: 15,
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

    const handleObjectSelected = (event) => {
      console.log(event);
      if (event.selected[0].text) {
        setIsTextSelected(true);
      } else {
        setIsTextSelected(false);
      }
    };

    can.on("selection:created", handleObjectSelected);
    can.on("selection:updated", handleObjectSelected);

    return () => {
      can.dispose();
    };
  }, [backgroundColor, canvasSize.height, canvasSize.width]);

  const addRectangle = (canvas) => {
    const rect = new fabric.Rect({
      height: 280,
      width: 200,
      fill: "white",
    });
    canvas.add(rect);
    canvas.renderAll();
  };

  const download = () => {
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
  };
  const saveJsonTemplate = () => {
    const canvasJSON = canvas.toJSON();
    console.log("Fabric.js Canvas JSON:", canvasJSON);
  };

  const addText = () => {
    const newText = new fabric.Textbox("Id:", {
      left: 300,
      top: 200,
    });
    canvas.add(newText);
  };
  const addIdPin = (str) => {
    const text = new fabric.Textbox(str, {
      left: 300,
      top: 200,
    });

    canvas.add(text);
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

  const handleTextChange = (event, action) => {
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

      {isTextSelected ? (
        <div className="text-tools">
          <select onChange={(e) => handleTextChange(e, "font")}>
            {fonts.map((curr, i) => {
              return (
                <option value={curr} key={i}>
                  {curr}
                </option>
              );
            })}
          </select>

          <label>
            Size:
            <input type="number" />
          </label>

          <button onClick={(e) => handleTextChange(e, "bold")}>B</button>
        </div>
      ) : (
        <></>
      )}
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
