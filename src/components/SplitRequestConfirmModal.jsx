import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { mockRetailers } from "../data/mockRetailers";
import { fmtDate } from "../lib/format";

const retailerLabel = (code) => mockRetailers.find((r) => r.code === code)?.name ?? code;

/**
 * SplitRequestConfirmModal — Manual Review & Create's retailer-launch-date
 * split confirmation. Opens over the unchanged Review & Create screen
 * (ManualRequestWizard keeps rendering the normal Review body underneath;
 * this is a sibling overlay, same pattern as Bulk CSV's
 * `ConfirmCreateModal`) only when the current draft's retailer launch dates
 * will actually produce more than one Request.
 *
 * Built directly on the shared `Modal` primitive — 552px width, backdrop,
 * Escape/focus trap, footer-driven actions, all unchanged.
 *
 * `groups` — the wizard's own `groupProductsByLaunchDate` output
 * (lib/groupByRetailer.js): `{ date, products, retailers }[]`. This modal
 * only ever reads `date`/`retailers` per group — it deliberately does not
 * repeat title/description/content type/assignee/supporting materials,
 * since those are shared across every resulting request and showing them
 * per-group would misleadingly imply they could differ.
 */
export function SplitRequestConfirmModal({ groups, onBack, onConfirm }) {
  const count = groups.length;

  return (
    <Modal
      title={`Create ${count} requests?`}
      onCancel={onBack}
      footer={
        <>
          <Button variant="ghost" onClick={onBack}>
            Back to review
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Create {count} requests
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">Your retailer launch dates will create separate requests.</p>

        <div className="flex flex-col gap-3">
          {groups.map((g, i) => (
            <div key={`${g.date}__${i}`} className="rounded-box border border-base-300 bg-base-200/50 px-4 py-3">
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Request {i + 1}</p>
              <p className="text-sm text-base-content mt-1">{g.retailers.map(retailerLabel).join(", ")}</p>
              <p className="text-xs text-base-content/60 mt-0.5">{fmtDate(g.date)}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
