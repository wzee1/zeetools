export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export async function copyBlob(blob: Blob) {
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text: string, filename: string, type = "text/plain") {
  downloadBlob(new Blob([text], { type }), filename);
}

/**
 * Lets a file be dragged out of the window onto the desktop. Chromium only;
 * other browsers ignore the DownloadURL type, so always offer a download button too.
 * The URL must stay valid until the drop finishes, so revoke it yourself on dragend.
 */
export function setDragOutData(event: React.DragEvent, url: string, filename: string, type: string) {
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("DownloadURL", `${type}:${filename}:${url}`);
  event.dataTransfer.setData("text/uri-list", url);
}
