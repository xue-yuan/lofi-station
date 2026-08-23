import { createSignal, onCleanup, createEffect, type Accessor } from "solid-js";

export interface DraggableOptions {
  width: number;
  height: number;
  isActive: Accessor<boolean>;
}

export interface Draggable {
  position: Accessor<{ x: number; y: number }>;
  isDragging: Accessor<boolean>;
  handleProps: {
    onMouseDown: (e: MouseEvent) => void;
    onTouchStart: (e: TouchEvent) => void;
  };
}

const clampToViewport = (x: number, y: number, width: number, height: number) => ({
  x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - width))),
  y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - height))),
});

export const createDraggable = (options: DraggableOptions): Draggable => {
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  let offset = { x: 0, y: 0 };
  let hasBeenPlaced = false;

  const centre = () => {
    setPosition(
      clampToViewport(
        (window.innerWidth - options.width) / 2,
        (window.innerHeight - options.height) / 2,
        options.width,
        options.height,
      ),
    );
  };

  createEffect(() => {
    if (options.isActive() && !hasBeenPlaced) {
      hasBeenPlaced = true;
      centre();
    }
  });

  createEffect(() => {
    if (!options.isActive()) return;
    const onResize = () => {
      const { x, y } = position();
      setPosition(clampToViewport(x, y, options.width, options.height));
    };
    window.addEventListener("resize", onResize);
    onCleanup(() => window.removeEventListener("resize", onResize));
  });

  const moveTo = (clientX: number, clientY: number) => {
    setPosition(
      clampToViewport(clientX - offset.x, clientY - offset.y, options.width, options.height),
    );
  };

  createEffect(() => {
    if (!isDragging()) return;

    const onMouseMove = (e: MouseEvent) => moveTo(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      moveTo(touch.clientX, touch.clientY);
    };
    const stop = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stop);
    window.addEventListener("touchcancel", stop);

    onCleanup(() => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
      window.removeEventListener("touchcancel", stop);
    });
  });

  const startAt = (clientX: number, clientY: number) => {
    offset = { x: clientX - position().x, y: clientY - position().y };
    setIsDragging(true);
  };

  return {
    position,
    isDragging,
    handleProps: {
      onMouseDown: (e: MouseEvent) => startAt(e.clientX, e.clientY),
      onTouchStart: (e: TouchEvent) => {
        const touch = e.touches[0];
        if (touch) startAt(touch.clientX, touch.clientY);
      },
    },
  };
};
