import { MessageSquare, Image, Paperclip } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Ask anything and get a response.",
  },
  {
    icon: Image,
    title: "Generate",
    description: "Type /image or click the image button.",
  },
  {
    icon: Paperclip,
    title: "Upload",
    description: "Attach images to discuss them.",
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto px-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <feature.icon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary group-hover:text-glow transition-all">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
