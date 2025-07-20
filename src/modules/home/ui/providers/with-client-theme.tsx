"use client";

import React, { useEffect, useState } from "react";

interface ClientThemeConfig<T> {
  fallback: React.ComponentType<T>;
  fallbackProps?: Partial<T>;
}

function withClientTheme<T extends object>(
  Component: React.ComponentType<T>,
  config: ClientThemeConfig<T>
) {
  const { fallback: FallbackComponent, fallbackProps } = config;

  const WrappedComponent = (props: T) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return <FallbackComponent {...props} {...(fallbackProps as T)} />;
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
}

export default withClientTheme;
