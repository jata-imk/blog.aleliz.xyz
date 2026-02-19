import React, { useState, useEffect, useRef } from 'react';

const PDFViewer = ({ 
  pdfUrl, 
  width = 800, 
  showControls = true,
  className = "" 
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRef = useRef(null);
  const [loadingStatus, setLoadingStatus] = useState('Inicializando...');

  // Cargar PDF.js solo en el cliente
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        setLoadingStatus('Cargando PDF.js...');
        
        // Verificar si PDF.js ya está cargado
        if (window.pdfjsLib) {
          setLoadingStatus('PDF.js ya disponible');
          loadPDF();
          return;
        }

        // Cargar PDF.js desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        
        script.onload = () => {
          setLoadingStatus('Configurando PDF.js...');
          // Configurar worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          // Pequeño delay para asegurar que todo esté listo
          setTimeout(() => {
            setLoadingStatus('Cargando documento PDF...');
            loadPDF();
          }, 100);
        };
        
        script.onerror = () => {
          setError('Error al cargar PDF.js desde CDN');
          setLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        setError('Error al inicializar el visor PDF: ' + err.message);
        setLoading(false);
      }
    };

    loadPDFJS();
  }, []);

  const loadPDF = async () => {
    if (!window.pdfjsLib) {
      setError('PDF.js no está disponible');
      setLoading(false);
      return;
    }
    
    try {
      setLoadingStatus('Descargando archivo PDF...');
      console.log('Intentando cargar PDF desde:', pdfUrl);
      
      const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise;
      console.log('PDF cargado exitosamente, páginas:', pdf.numPages);
      
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar PDF:', err);
      setError(`Error al cargar el archivo PDF: ${err.message}`);
      setLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      console.log('Renderizando página:', pageNum);
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Limpiar canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      console.log('Página renderizada exitosamente');
    } catch (err) {
      console.error('Error al renderizar la página:', err);
      setError(`Error al renderizar la página: ${err.message}`);
    }
  };

  // Renderizar página cuando cambie el número de página o la escala
  useEffect(() => {
    if (pdfDoc && !loading) {
      renderPage(pageNumber);
    }
  }, [pageNumber, scale, pdfDoc, loading]);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.0, prev + 0.1));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Cargando PDF...</p>
          <p className="text-gray-500 text-sm">{loadingStatus}</p>
          <p className="text-gray-400 text-xs mt-2">PDF URL: {pdfUrl}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">Error al cargar el PDF</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <p className="text-red-500 text-xs mt-2">URL: {pdfUrl}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Controles */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              Página {pageNumber} de {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Visor PDF */}
      <div className="overflow-auto max-h-[800px] flex justify-center p-4 bg-gray-100">
        <canvas 
          ref={canvasRef}
          className="border border-gray-300 shadow-sm max-w-full bg-white"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Información adicional */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Usa las flechas para navegar • Zoom: {Math.round(scale * 100)}%</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Descargar PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;