import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ScreenNodeData } from '../types';
import { sendPinToIframe } from '../lib/pinBridge';

type ScreenNodeType = Node<ScreenNodeData, 'screenNode'>;

function ScreenNode({ data }: NodeProps<ScreenNodeType>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const zoomLevel = data.zoomLevel ?? 0.5;
  const canGoLive = data.canGoLive ?? false;

  const nodeWidth = 480;
  const containerHeight = 300;
  const iframeScale = 0.375;

  useEffect(() => {
    if (zoomLevel > 1.0 && canGoLive && !isLive) {
      setIsLive(true);
    }
  }, [zoomLevel, canGoLive, isLive]);

  const handleGoLive = useCallback(() => {
    if (!isLive) {
      setIsLive(true);
      data.onRequestLoad?.(data.nodeId ?? '');
    }
  }, [isLive, data]);

  const handleIframeLoad = useCallback(() => {
    setIframeReady(true);
    data.onIframeLoaded?.(data.nodeId ?? '');

    if (iframeRef.current && data.pinnedState) {
      sendPinToIframe(iframeRef.current, data.pinnedState);
    }
  }, [data]);

  useEffect(() => {
    if (isLive && iframeReady && iframeRef.current && data.pinnedState) {
      sendPinToIframe(iframeRef.current, data.pinnedState);
    }
  }, [data.pinnedState, isLive, iframeReady]);

  useEffect(() => {
    if (!isLive) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'fc-wheel') return;
      const iframe = iframeRef.current;
      if (!iframe) return;
      if (e.source !== iframe.contentWindow) return;
      const syntheticWheel = new WheelEvent('wheel', {
        deltaX: e.data.deltaX,
        deltaY: e.data.deltaY,
        clientX: iframe.getBoundingClientRect().left + e.data.clientX * iframeScale,
        clientY: iframe.getBoundingClientRect().top + e.data.clientY * iframeScale,
        ctrlKey: e.data.ctrlKey,
        metaKey: e.data.metaKey,
        bubbles: true,
      });
      iframe.dispatchEvent(syntheticWheel);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isLive, iframeScale]);

  const handlePinClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onOpenPinEditor?.(data.nodeId ?? '');
    },
    [data]
  );

  const showLiveIframe = isLive;
  const showScreenshot = !isLive && data.screenshotUrl && zoomLevel >= 0.5;
  const showPlaceholder = !showLiveIframe && !showScreenshot;

  return (
    <div
      className={`fc-node ${data.isActive ? 'is-active' : ''} ${isLive ? 'is-live' : ''}`}
      style={{ width: nodeWidth }}
      onDoubleClick={handleGoLive}
    >
      {/* Floating label — Figma-style: route on left, component on right */}
      <div className="fc-node-label drag-handle">
        <span className={`fc-node-name ${data.isActive ? 'selected' : ''}`}>
          {data.hasPinnedState && <span className="fc-pin-dot" />}
          {isLive && <span className="fc-live-dot" />}
          {data.routePath}
        </span>
        <span className="fc-node-actions">
          <span className="fc-node-component">{data.componentName}</span>
          <button className={`fc-action-btn ${data.hasPinnedState ? 'is-pinned' : ''}`} onClick={handlePinClick} title="Pin state">
            ⚙
          </button>
        </span>
      </div>

      {/* Screen content — flat, no header bar */}
      <div className="fc-node-screen" style={{ width: nodeWidth, height: containerHeight }}>
        {showLiveIframe && (
          <iframe
            ref={iframeRef}
            key={data.iframeSrc}
            src={data.iframeSrc}
            width={1280}
            height={800}
            onLoad={handleIframeLoad}
            style={{
              border: 'none',
              pointerEvents: 'auto',
              transform: `scale(${iframeScale})`,
              transformOrigin: 'top left',
              opacity: iframeReady ? 1 : 0,
            }}
            title={data.componentName}
          />
        )}

        {showScreenshot && (
          <img
            src={data.screenshotUrl}
            alt={data.routePath}
            style={{
              width: nodeWidth,
              height: containerHeight,
              objectFit: 'cover',
              objectPosition: 'top left',
            }}
          />
        )}

        {showPlaceholder && (
          <div className="fc-node-placeholder" style={{ width: nodeWidth, height: containerHeight }}>
            <span className="fc-placeholder-text">{data.componentName}</span>
          </div>
        )}

        {showLiveIframe && !iframeReady && (
          <div className="fc-node-loading">
            <div className="fc-spinner" />
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="fc-handle" />
      <Handle type="source" position={Position.Right} className="fc-handle" />
    </div>
  );
}

export default memo(ScreenNode);
