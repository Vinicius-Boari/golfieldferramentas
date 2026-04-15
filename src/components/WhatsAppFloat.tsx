import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5511959409051"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[hsl(142,70%,45%)] text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-pulse-glow"
      style={{ boxShadow: "0 0 25px -5px hsl(142, 70%, 45%, 0.4)" }}
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
};

export default WhatsAppFloat;
