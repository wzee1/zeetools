"use client";

import { ArrowRight, Monitor } from "lucide-react";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import ShieldCheckIcon from "@zeetools/ui/components/icons/status/shield-check-icon";
import ZapIcon from "@zeetools/ui/components/icons/status/zap-icon";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Card } from "@zeetools/ui/components/ui/display/card";
import Kbd from "@zeetools/ui/components/ui/display/kbd";
import Input from "@zeetools/ui/components/ui/forms/input";
import { zee } from "@/zee.config";
import { BODY, CARD_FIT, FOOTER, SECTION } from "@/lib/card-classes";

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: "Zero Cloud Logging",
    body: "Room IDs exist solely in the URL hash fragment (#room). Edge servers never see or log your call keys.",
  },
  {
    icon: Monitor,
    title: "4K 60fps Screen Share",
    body: "Native 3840x2160 display constraints with uncompressed system audio pass-through for code & video reviews.",
  },
  {
    icon: ZapIcon,
    title: "SCTP File Dropping",
    body: "Direct peer-to-peer 64KB binary chunk transfers. Transfer gigabyte assets at raw local network line rate.",
  },
];

interface CreateRoomViewProps {
  slug: string;
  onChangeSlug: (slug: string) => void;
  onCreate: (e?: React.FormEvent) => void;
}

/** The home view: what the tool does, a custom slug, and the one action that opens a room. */
export default function CreateRoomView({ slug, onChangeSlug, onCreate }: CreateRoomViewProps) {
  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title="Distraction-free video calls, raw WebRTC speed.">{zee.description}</PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD_FIT}>
          <div className={BODY}>
            <ul className="grid divide-y divide-border @min-[40rem]:grid-cols-3 @min-[40rem]:divide-x @min-[40rem]:divide-y-0">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className={`${SECTION} min-w-0 space-y-3`}>
                  <div className="flex items-center gap-2.5">
                    <span className="size-4 shrink-0 text-muted [&>svg]:size-4">
                      <Icon />
                    </span>
                    <h3 className="text-base font-normal text-foreground">{title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>

            <form onSubmit={onCreate} className={`${SECTION} space-y-4 border-t border-border`}>
              <p className="text-sm text-muted">or custom slug</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs text-muted">#</span>
                  <Input
                    type="text"
                    value={slug}
                    onChange={(e) => onChangeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                    placeholder="my-agency-sync"
                    aria-label="Custom room slug"
                    className="h-10 pl-7"
                  />
                </div>
                <Button type="submit" variant="secondary" className="h-10 px-4">
                  Join
                </Button>
              </div>
            </form>
          </div>

          <div className={FOOTER}>
            <p className="text-xs text-muted">Zero-Account · Direct P2P · Pure Static Edge</p>
            <Button variant="primary" className="h-10 px-4" onClick={() => onCreate()}>
              <span>Create Private Room</span>
              <ArrowRight />
              <Kbd hotkey="enter" className="hidden sm:inline-flex" />
            </Button>
          </div>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
