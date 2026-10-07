export async function compressImage(file) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  await new Promise((r) => (img.onload = r));

  const canvas = document.createElement("canvas");
  const scale = Math.min(1024 / img.width, 1);

  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(new File([blob], "crop.jpg", { type: "image/jpeg" })),
      "image/jpeg",
      0.8
    );
  });
}
