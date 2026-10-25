"use client";

import { useId } from "react";
import { ArrowRight } from "lucide-react";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import SettingsIcon from "@zeetools/ui/components/icons/system/settings-icon";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Card } from "@zeetools/ui/components/ui/display/card";
import Kbd from "@zeetools/ui/components/ui/display/kbd";
import Input from "@zeetools/ui/components/ui/forms/input";
import Label from "@zeetools/ui/components/ui/forms/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@zeetools/ui/components/ui/navigation/accordion";
import { cn } from "@zeetools/ui/lib/utils";
import DeviceSelector, { type DeviceSelectorProps } from "@/components/lobby/DeviceSelector";
import PreCallPreview, { type PreCallPreviewProps } from "@/components/lobby/PreCallPreview";
import { CARD, FOOTER, SECTION } from "@/lib/card-classes";

interface LobbyViewProps {
  roomName: string;
  preview: Omit<PreCallPreviewProps, "displayName">;
  displayName: string;
  onChangeDisplayName: (name: string) => void;
  devices: DeviceSelectorProps;
  onJoin: () => void;
}

/** The room before joining: the camera preview is the card's surface, the name and devices sit beside it. */
export default function LobbyView({ roomName, preview, displayName, onChangeDisplayName, devices, onJoin }: LobbyViewProps) {
  const nameId = useId();

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader
        title="Ready to join?"
        aside={
          <span className="inline-flex h-7 items-center rounded-control border border-border px-2.5 font-mono text-xs text-muted">
            Room #{roomName}
          </span>
        }
      >
        Check your camera and microphone levels below.
      </PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD}>
          <div className="flex flex-col shell:min-h-0 shell:flex-1 shell:flex-row">
            <PreCallPreview {...preview} displayName={displayName} />

            <div className="flex flex-col border-t border-border shell:min-h-0 shell:w-80 shell:shrink-0 shell:overflow-y-auto shell:border-t-0 shell:border-l">
              <div className={cn(SECTION, "space-y-4")}>
                <Label htmlFor={nameId} className="text-base font-normal">Your Display Name</Label>
                <Input
                  id={nameId}
                  type="text"
                  value={displayName}
                  onChange={(e) => onChangeDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onJoin();
                  }}
                  placeholder="Anonymous Guest"
                  maxLength={32}
                  className="h-10"
                />
              </div>

              <Accordion type="single" collapsible className="border-t border-border">
                <AccordionItem value="devices">
                  <AccordionTrigger className="px-5 py-5 font-normal text-muted sm:px-8">
                    <span className="flex items-center gap-2">
                      <SettingsIcon className="size-4 text-muted" />
                      <span>Change Microphone, Camera or Speaker</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-6 sm:px-8">
                    <DeviceSelector {...devices} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className={cn(FOOTER, "@min-[34rem]:justify-end")}>
            <Button variant="primary" className="h-10 px-4" onClick={onJoin}>
              <span>Join Call #{roomName}</span>
              <ArrowRight />
              <Kbd hotkey="enter" className="hidden sm:inline-flex" />
            </Button>
          </div>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
