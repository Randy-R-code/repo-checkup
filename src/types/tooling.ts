export interface ToolEvidence {
  installed: boolean;
  configured: boolean;
}

export interface ToolingEvidence {
  eslint: ToolEvidence;
  biome: ToolEvidence;
  prettier: ToolEvidence;
}
