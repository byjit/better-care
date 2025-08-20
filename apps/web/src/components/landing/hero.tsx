import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const Hero = () => {
    const router = useRouter();
    return (
        <div className="w-full">
            <div className="container mx-auto">
                <div className="flex gap-8 py-20 lg:py-30 items-center justify-center flex-col">
                    <div className="flex gap-4 flex-col">
                        <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
                            Transforming Healthcare Communication
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                            Fast, affordable, accessible AI assisted healthcare solution for everyone.
                        </p>
                    </div>
                    <Button size="lg" className="gap-4" onClick={() => router.push("/login")}>
                        Get Started <MoveRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};