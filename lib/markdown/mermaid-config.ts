export const brainMermaidConfig = {
  theme: "base" as const,
  flowchart: {
    useMaxWidth: true,
    htmlLabels: false,
    curve: "basis" as const,
    padding: 14,
    nodeSpacing: 34,
    rankSpacing: 44,
    subGraphTitleMargin: {
      top: 10,
      bottom: 10,
    },
  },
  themeVariables: {
    background: "#12141a",
    mainBkg: "#252830",
    primaryColor: "#252830",
    primaryBorderColor: "#4a4f5c",
    primaryTextColor: "#e8eaed",
    secondaryColor: "#1e2128",
    tertiaryColor: "#181b22",
    lineColor: "#9aa0ad",
    textColor: "#e8eaed",
    nodeTextColor: "#e8eaed",
    clusterBkg: "#1a1d24",
    clusterBorder: "#3d4350",
    titleColor: "#ffffff",
    edgeLabelBackground: "#1a1d24",
    edgeLabelText: "#e8eaed",
    fontFamily: "arial, sans-serif",
    fontSize: "11px",
  },
};

export const rehypeMermaidOptions = {
  strategy: "pre-mermaid" as const,
  mermaidConfig: brainMermaidConfig,
};