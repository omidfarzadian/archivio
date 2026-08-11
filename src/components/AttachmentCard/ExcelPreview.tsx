import { IconFileSpreadsheet } from "@tabler/icons-react";
import {
  parseExcelPreview,
  type ExcelPreviewData,
} from "@/services/xlsx-preview.service";
import { loadFileBytes } from "@/services/file-bytes.service";
import { AttachmentDownloadButton } from "@/components/AttachmentCard/AttachmentDownloadButton";
import { useEffect, useState } from "react";

interface ExcelPreviewProps {
  base64?: string;
  localPath?: string;
  name: string;
  mimeType: string;
  className?: string;
}

export function ExcelPreview({
  base64,
  localPath,
  name,
  mimeType,
  className,
}: ExcelPreviewProps) {
  const [preview, setPreview] = useState<ExcelPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await loadFileBytes(base64, localPath);
        if (!data) {
          setPreview(null);
          return;
        }
        const parsed = await parseExcelPreview(data);
        if (!cancelled) setPreview(parsed);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [base64, localPath, name]);

  if (loading) {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-green-100 bg-white ${className ?? ""}`}
      >
        <div className="flex items-center gap-2 border-b border-green-100 bg-green-50 px-3 py-2">
          <IconFileSpreadsheet size={16} className="text-green-600" />
          <span className="text-xs font-medium text-green-700">Excel</span>
        </div>
        <div className="file-preview-scroll h-48 animate-pulse bg-green-50/40" />
      </div>
    );
  }

  if (!preview || (preview.headers.length === 0 && preview.rows.length === 0)) {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-green-100 bg-white ${className ?? ""}`}
      >
        <div className="file-preview-scroll flex h-48 items-center justify-center gap-2 bg-green-50/50">
          <IconFileSpreadsheet size={24} className="text-green-600" />
          <span className="text-xs text-green-700">فایل Excel</span>
        </div>
      </div>
    );
  }

  const columns =
    preview.headers.length > 0 ? preview.headers : (preview.rows[0] ?? []);
  const bodyRows =
    preview.headers.length > 0 ? preview.rows : preview.rows.slice(1);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-green-100 bg-white ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-green-100 bg-green-50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <IconFileSpreadsheet size={16} className="text-green-600" />
          <span className="text-xs font-medium text-green-700">Excel</span>
        </div>
        <div className="flex items-center gap-1">
          <AttachmentDownloadButton
            name={name}
            mimeType={mimeType}
            base64={base64}
            localPath={localPath}
            className="text-green-700 hover:bg-green-100"
          />
        </div>
      </div>
      <div className="file-preview-scroll">
        <table className="w-full min-w-max border-collapse text-xs leading-relaxed">
          {columns.length > 0 && (
            <thead className="sticky top-0 z-10">
              <tr className="bg-green-50">
                {columns.map((header, i) => (
                  <th
                    key={i}
                    className="border-l border-green-100 px-3 py-2 text-right font-medium text-green-900 whitespace-nowrap"
                  >
                    {header || "—"}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-green-50/30"}
              >
                {(columns.length > 0 ? columns : row).map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="border-l border-t border-green-100 px-3 py-2 text-text whitespace-nowrap"
                  >
                    {row[colIndex] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
