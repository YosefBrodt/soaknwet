import { Warp } from "@paper-design/shaders-react";

export function WaterShaderBackground() {
  return (
    <div className="absolute inset-0">
      <Warp
        style={{ height: "100%", width: "100%" }}
        proportion={0.5}
        softness={1}
        distortion={0.22}
        swirl={0.85}
        swirlIterations={12}
        shape="stripes"
        shapeScale={0.12}
        scale={1}
        rotation={0}
        speed={0.9}
        colors={[
          "hsl(198, 60%, 14%)",
          "hsl(195, 35%, 55%)",
          "hsl(185, 40%, 22%)",
          "hsl(170, 45%, 70%)",
        ]}
      />
    </div>
  );
}

