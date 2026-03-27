import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ScreenNodeData } from '../types';
import { sendPinToIframe } from '../lib/pinBridge';
import DevToolsPanel from './DevToolsPanel';

type ScreenNodeType = Node<ScreenNodeData, 'screenNode'>;

function ScreenNode({ data }: NodeProps<ScreenNodeType>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const zoomLevel = data.zoomLevel ?? 0.5;
  const canGoLive = data.canGoLive ?? false;
  const forceLive = data.forceLive;
  const reloadKey = data.reloadKey ?? 0;
  const hideLabel = data.hideLabel ?? false;
  const devToolsState = data.devToolsState;
  const errorCount = devToolsState?.console.filter(e => e.level === 'error').length ?? 0;

  const iframeWidth = data.viewportWidth ?? 1280;
  const iframeHeight = data.viewportHeight ?? 800;
  const nodeWidth = 480;
  const iframeScale = nodeWidth / iframeWidth;
  const containerHeight = Math.round(iframeHeight * iframeScale);

  // forceLive === false means show thumbnail, forceLive === true or undefined means auto
  useEffect(() => {
    if (forceLive === false) {
      setIsLive(false);
      return;
    }
    if (forceLive === true && !isLive) {
      setIsLive(true);
      return;
    }
    if (zoomLevel > 0.3 && canGoLive && !isLive) {
      setIsLive(true);
    }
  }, [zoomLevel, canGoLive, isLive, forceLive]);

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

  const showLiveIframe = isLive;
  const showScreenshot = !isLive && data.screenshotUrl && zoomLevel >= 0.5;
  const showPlaceholder = !showLiveIframe && !showScreenshot;

  return (
    <div
      className={`fc-node ${data.isActive ? 'is-active' : ''} ${isLive ? 'is-live' : ''}`}
      style={{ width: nodeWidth }}
      onClick={handleGoLive}
    >
      {/* Floating label — Figma-style: route on left, component on right */}
      <div className={`fc-node-label drag-handle ${hideLabel ? 'is-hidden' : ''}`}>
        <span className={`fc-node-name ${data.isActive ? 'selected' : ''}`}>
          {data.hasPinnedState && <span className="fc-pin-dot" />}
          {isLive && <span className="fc-live-dot" />}
          {data.routePath}
        </span>
        <span className="fc-node-actions">
          <span className="fc-node-component">{data.componentName}</span>
        </span>
      </div>

      {/* Screen content — flat, no header bar */}
      <div className="fc-node-screen" style={{ width: nodeWidth, height: containerHeight }}>
        {showLiveIframe && (
          <>
            <iframe
              ref={iframeRef}
              key={`${data.iframeSrc}-${reloadKey}`}
              src={data.iframeSrc}
              width={iframeWidth}
              height={iframeHeight}
              onLoad={handleIframeLoad}
              style={{
                border: 'none',
                pointerEvents: data.isActive ? 'auto' : 'none',
                transform: `scale(${iframeScale})`,
                transformOrigin: 'top left',
                opacity: iframeReady ? 1 : 0,
              }}
              title={data.componentName}
            />
            {/* Click overlay — only shown when not selected, so first click selects, then iframe is interactive */}
            {!data.isActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  cursor: 'pointer',
                }}
              />
            )}
          </>
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

      {/* DevTools toggle + panel */}
      {isLive && iframeReady && devToolsState && (
        <>
          <div className="fc-dt-toggle" onClick={() => setDevToolsOpen(!devToolsOpen)} style={{ width: nodeWidth }}>
            <span className="fc-dt-toggle-label">
              DevTools
              {errorCount > 0 && <span className="fc-dt-badge fc-dt-badge-error">{errorCount}</span>}
            </span>
            <span className={`fc-dt-toggle-arrow ${devToolsOpen ? 'is-open' : ''}`}>▾</span>
          </div>
          {devToolsOpen && (
            <div style={{ width: nodeWidth }}>
              <DevToolsPanel
                state={devToolsState}
                nodeId={data.nodeId ?? ''}
                onClearConsole={data.onClearConsole ?? (() => {})}
                onClearNetwork={data.onClearNetwork ?? (() => {})}
                onRequestStorage={data.onRequestStorage ?? (() => {})}
                iframeRef={iframeRef}
              />
            </div>
          )}
        </>
      )}

      <Handle type="target" position={Position.Left} className="fc-handle" />
      <Handle type="source" position={Position.Right} className="fc-handle" />
    </div>
  );
}

export default memo(ScreenNode);
