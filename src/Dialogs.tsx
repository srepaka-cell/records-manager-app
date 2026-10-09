import { useState } from 'react';
import { Dialog } from './Dialog';
import { APPROVER_OPTIONS, type Approval } from './data';
import { NOW, type RecordFile } from './membership';
import { formatDisposition, isBlank, parseUtcInput } from './format';

const REASONS = [
  { value: 'declared_in_error', label: 'Declared in error' },
  { value: 'wrong_record_type', label: 'Wrong record type' },
  { value: 'no_longer_a_record', label: 'No longer a record' },
  { value: 'other', label: 'Other' },
];

type UndeclareDialogProps = {
  file: RecordFile;
  onClose: () => void;
  onConfirm: (file: RecordFile) => void;
};

export function UndeclareDialog({ file, onClose, onConfirm }: UndeclareDialogProps) {
  const [reason, setReason] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const submit = () => {
    if (!reason) {
      setError('Choose a reason.');
      return;
    }
    if (isBlank(text)) {
      setError('Enter a reason in words. Spaces alone are not enough.');
      return;
    }
    onConfirm(file);
    setDone(
      file.id === 1002
        ? 'File 1002 is undeclared and leaves this area. Legal hold 9 remains in force.'
        : `File ${file.id} is undeclared and is no longer in these counts.`,
    );
    setError('');
  };

  return (
    <Dialog title={`Undeclare file ${file.id}`} onClose={onClose}>
      {done ? (
        <p className="banner success" role="status">
          {done}
        </p>
      ) : (
        <>
          <dl className="facts">
            <div>
              <dt>Record type</dt>
              <dd>{file.recordType}</dd>
            </div>
            <div>
              <dt>Disposition time</dt>
              <dd>{formatDisposition(file.dispositionUtc, file.dispositionText)}</dd>
            </div>
            <div>
              <dt>Policy ids that will be lifted</dt>
              <dd>{file.policiesApplied.length > 0 ? file.policiesApplied.join(', ') : 'None'}</dd>
            </div>
            <div>
              <dt>Policy ids that will stay</dt>
              <dd>{file.policiesStay.length > 0 ? file.policiesStay.join(', ') : 'None'}</dd>
            </div>
            <div>
              <dt>Hold ids that will remain</dt>
              <dd>{file.holdIds.length > 0 ? file.holdIds.join(', ') : 'None'}</dd>
            </div>
          </dl>
          <p>
            This clears the declaration, lifts only the listed policies, and leaves any legal hold in force. The file stays
            where it is. Turning the Records area off will not restore the declaration.
          </p>
          {file.jobRunning ? <p>A disposition job that already passed the hold check is not recalled.</p> : null}
          <label className="field" htmlFor="undeclare-reason">
            Reason
            <select
              id="undeclare-reason"
              data-target-id="UndeclareDialog-chooseReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option value="">Choose a reason</option>
              {REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="undeclare-text">
            Reason text
            <textarea
              id="undeclare-text"
              data-target-id="UndeclareDialog-enterReason"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          {error ? (
            <p className="banner error" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
      <div className="dialog-actions">
        <button type="button" data-target-id="UndeclareDialog-close" onClick={onClose}>
          {done ? 'Close' : 'Cancel'}
        </button>
        {done ? null : (
          <button type="button" className="primary" data-target-id="UndeclareDialog-submit" onClick={submit}>
            Undeclare
          </button>
        )}
      </div>
    </Dialog>
  );
}

type ExtendDialogProps = {
  file: RecordFile;
  onClose: () => void;
  onSave: (file: RecordFile, utc: number) => void;
};

export function ExtendDialog({ file, onClose, onSave }: ExtendDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const save = () => {
    const parsed = parseUtcInput(value);
    if (parsed == null) {
      setError('Enter a UTC time, such as 2026-11-08T00:00.');
      return;
    }
    if (parsed <= NOW) {
      setError('The new disposition time must be after 2026-10-08 00:00 UTC.');
      return;
    }
    if (file.dispositionUtc != null && parsed <= file.dispositionUtc) {
      setError('The new disposition time must be later than the current time.');
      return;
    }
    onSave(file, parsed);
    setDone(`Disposition time for file ${file.id} is now ${formatDisposition(parsed)}.`);
    setError('');
  };

  return (
    <Dialog title={`Extend retention for file ${file.id}`} onClose={onClose}>
      <p>Current disposition time: {formatDisposition(file.dispositionUtc, file.dispositionText)}</p>
      {done ? (
        <p className="banner success" role="status">
          {done}
        </p>
      ) : (
        <>
          <label className="field" htmlFor="extend-time">
            New disposition time (UTC)
            <input
              id="extend-time"
              data-target-id="ExtendDialog-enterTime"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="2026-11-08T00:00"
            />
          </label>
          <button
            type="button"
            data-target-id="ExtendDialog-useExampleDate"
            onClick={() => setValue('2026-11-08T00:00')}
          >
            Use 2026-11-08 00:00 UTC
          </button>
          {error ? (
            <p className="banner error" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
      <div className="dialog-actions">
        <button type="button" data-target-id="ExtendDialog-close" onClick={onClose}>
          {done ? 'Close' : 'Cancel'}
        </button>
        {done ? null : (
          <button type="button" className="primary" data-target-id="ExtendDialog-save" onClick={save}>
            Save
          </button>
        )}
      </div>
    </Dialog>
  );
}

type SendDialogProps = {
  file: RecordFile;
  onClose: () => void;
  onStart: (approval: Approval) => void;
};

export function SendDialog({ file, onClose, onStart }: SendDialogProps) {
  const [mode, setMode] = useState<'set' | 'sequence'>('set');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const start = () => {
    const chosen = [first, second].filter(Boolean);
    if (chosen.length === 0) {
      setError('Name at least one approver who can see this record type.');
      return;
    }
    if (chosen.includes('me')) {
      setError('You cannot approve your own route.');
      return;
    }
    if (new Set(chosen).size !== chosen.length) {
      setError('Name each approver once.');
      return;
    }
    for (const id of chosen) {
      const person = APPROVER_OPTIONS.find((option) => option.id === id);
      if (!person || !person.canSee.includes(file.recordType)) {
        setError(`${person?.name ?? 'That person'} cannot see this record type.`);
        return;
      }
    }
    const decisions: Approval['decisions'] = {};
    chosen.forEach((id) => {
      decisions[id] = 'pending';
    });
    onStart({ fileId: file.id, mode, approverIds: chosen, decisions, status: 'open' });
    setDone(`A ${mode} route started for file ${file.id}. The named people now have an approval task.`);
    setError('');
  };

  return (
    <Dialog title={`Send file ${file.id} for approval`} onClose={onClose}>
      {done ? (
        <p className="banner success" role="status">
          {done}
        </p>
      ) : (
        <>
          <fieldset className="choices">
            <legend>Route type</legend>
            <label>
              <input
                type="radio"
                name="route-type"
                data-target-id="SendDialog-chooseSet"
                checked={mode === 'set'}
                onChange={() => setMode('set')}
              />
              Set. Ask everyone at once.
            </label>
            <label>
              <input
                type="radio"
                name="route-type"
                data-target-id="SendDialog-chooseSequence"
                checked={mode === 'sequence'}
                onChange={() => setMode('sequence')}
              />
              Sequence. Ask each person in order.
            </label>
          </fieldset>
          <PersonSelect id="approver-1" label={mode === 'sequence' ? 'First approver' : 'Approver 1'} value={first} onChange={setFirst} target="SendDialog-chooseFirstApprover" />
          <PersonSelect id="approver-2" label={mode === 'sequence' ? 'Second approver' : 'Approver 2'} value={second} onChange={setSecond} target="SendDialog-chooseSecondApprover" />
          {error ? (
            <p className="banner error" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
      <div className="dialog-actions">
        <button type="button" data-target-id="SendDialog-close" onClick={onClose}>
          {done ? 'Close' : 'Cancel'}
        </button>
        {done ? null : (
          <button type="button" className="primary" data-target-id="SendDialog-startRoute" onClick={start}>
            Start route
          </button>
        )}
      </div>
    </Dialog>
  );
}

function PersonSelect({
  id,
  label,
  value,
  onChange,
  target,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  target: string;
}) {
  return (
    <label className="field" htmlFor={id}>
      {label}
      <select id={id} data-target-id={target} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">None</option>
        {APPROVER_OPTIONS.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>
    </label>
  );
}
