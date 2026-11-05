"""Package a clean, exact-revision candidate without publishing it. Standard library only."""
from pathlib import Path
import hashlib, json, os, subprocess, zipfile, datetime
ROOT = Path(__file__).resolve().parents[2]
candidate = json.loads((ROOT/'scripts/release/candidate.json').read_text())
run = lambda *args: subprocess.check_output(args, cwd=ROOT, text=True).strip()
if run('git', 'status', '--porcelain'):
    raise SystemExit('Refusing to label a dirty tree as an exact-revision candidate. Commit verified source first.')
revision = run('git', 'rev-parse', 'HEAD')
dist = ROOT/'dist-release'
info = json.loads((dist/'build-info.json').read_text())
if info.get('dirtyAtBuild', True):
    raise SystemExit('Candidate was built with uncommitted source. Rebuild from the clean exact revision.')
if info['sourceRevision'] != revision:
    raise SystemExit('Candidate build revision differs from HEAD. Rebuild the release target.')
subprocess.run(['node', 'scripts/release/verify.mjs'], cwd=ROOT, check=True)
evidence = ROOT/os.environ.get('AVA_RELEASE_EVIDENCE', '.release-verification')
inventory = json.loads((evidence/'inventory.json').read_text())
checksums = (evidence/'SHA256SUMS').read_bytes()
metadata = {'label':candidate['label'], 'sourceRevision':revision,
            'sourceWebTree':info['webTree'], 'inventory':inventory['counts'],
            'buildCommand':'npm ci && npm run build:release',
            'verifyCommand':'npm run verify:release',
            'publicationStatus':'Not authorized; generated-design/terms acceptance, contributor scope and external validation pending',
            'identityStatus':{'publicRobot':'Augie','stableKey':'tars','nameDecision':'Owner selected','designReview':'Existing independent design reviewed and retained; not legal clearance'},
            'ownerChecklist':'web/docs/RELEASE_FINALIZATION.md#owner-checklist',
            'hostingAssumptions':'Serve only site/ with relative paths and trailing-slash subsection, correct media types, compatible blob image decoding/inline styles; revalidate unhashed assets. No deployment authorization.',
            'files':inventory['files']}
stamp = int(run('git', 'show', '-s', '--format=%ct', revision))
date = datetime.datetime.fromtimestamp(stamp, datetime.timezone.utc)
date_tuple = (max(1980,date.year),date.month,date.day,date.hour,date.minute,date.second)
out = ROOT/'release-artifacts'; out.mkdir(exist_ok=True)
archive = out/f'astronauts-vs-aliens-expedition-{candidate["identifier"]}-{revision[:12]}.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    entries = [(f'site/{r["file"]}',(dist/r['file']).read_bytes()) for r in inventory['files']]
    entries += [('BUILD.json',(json.dumps(metadata,indent=2)+'\n').encode()),('SHA256SUMS',checksums)]
    for name,data in sorted(entries):
        item = zipfile.ZipInfo(name,date_tuple)
        item.compress_type = zipfile.ZIP_DEFLATED
        item.external_attr = 0o100644 << 16
        z.writestr(item,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
record = {'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(), **metadata}
(out/f'{archive.stem}.json').write_text(json.dumps(record,indent=2)+'\n')
(archive.with_suffix('.zip.sha256')).write_text(f'{record["sha256"]}  {archive.name}\n')
print(json.dumps({k:record[k] for k in ['archive','bytes','sha256','sourceRevision']},indent=2))
