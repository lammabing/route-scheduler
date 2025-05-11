
import { SpecialInfo } from "@/types";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface SpecialInfoDisplayProps {
  specialInfo: SpecialInfo[];
}

const SpecialInfoDisplay = ({ specialInfo }: SpecialInfoDisplayProps) => {
  return (
    <div className="space-y-3">
      {specialInfo.map((info) => (
        <Card key={info.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{info.title}</CardTitle>
                <CardDescription className="mt-2">
                  {info.content}
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SpecialInfoDisplay;
