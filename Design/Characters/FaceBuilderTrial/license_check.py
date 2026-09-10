exec(compile(open(__file__.replace('license_check.py','probe.py'),encoding='utf-8').read(),__file__,'exec'))
print('LICENSE_API', [x for x in dir(fb.license_manager()) if not x.startswith('_')],flush=True)
try:
    result=fb.license_manager().perform_license_and_trial_check(strategy=pkt.LicenseCheckStrategy.FORCE)
    print('STATUS_TEXT',fb.license_manager().license_status_text(),flush=True)
    print('CHECK_FIELDS',dir(result[0]),flush=True)
    for field in ['license_status','trial_status']:
        item=getattr(result[0],field,None)
        print(field,[(k,getattr(item,k,None)) for k in ['status','message']],flush=True)
except Exception:
    traceback.print_exc()
