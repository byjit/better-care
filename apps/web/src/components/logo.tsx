import { Leaf } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Leaf className="size-5" />
      <span className="truncate font-medium">Better Care AI</span>
    </div>
  );
}