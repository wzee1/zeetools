import Link from "next/link";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import ZeeButton from "@/components/zee-ui/ZeeButton";

/** Button-styled link back to the create form, shown on the reveal page's dead-end states. */
export default function CreateAnotherLink() {
  return (
    <Link href="/" className="inline-block">
      <ZeeButton variant="secondary" className="h-10 px-4">
        <PlusIcon className="size-4" />
        <span>Create a New Secret</span>
      </ZeeButton>
    </Link>
  );
}
