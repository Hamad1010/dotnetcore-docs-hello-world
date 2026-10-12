import re, sys
NOUNS = 'القانون|القاعده|الفكره|المهاره|السر|الاستراتيجيه|الخطوه|النوع|النقطه|المبدا|العلامه|الصفه|الطريقه|المرحله|النظريه|الركيزه|الفن|الامر|الاسلوب|المفتاح|العاده|المستوى|الدرس|السبب|الحيله|التكنيك|المعيار|المحور|الجزء|الشرط|الوصيه|الحقيقه|الخطا|المهارات|القوانين|القواعد'
pat = re.compile(r'(?:\b(?:' + NOUNS + r') (?:ال\S+ عشر|ال\S+|رقم \S+)|\bاول (?:نقطه|قاعده|قانون|سر|فكره|مهاره|خطوه|استراتيجيه|نوع|امر|مرحله|نظريه|طريقه))')
VALID2 = re.compile(r'^(?:ال(?:اول|اولى|ثاني|ثانيه|ثالث|ثالثه|ثال|رابع|رابعه|خامس|خامسه|سادس|سادسه|سابع|سابعه|ثامن|ثامنه|ثام|تاسع|تاسعه|تاس|عاشر|عاشره|حادي|حاديه|اخير|اخيره|عشرين)|رقم)')
t = open(sys.argv[1], encoding='utf-8').read()
W = int(sys.argv[2]) if len(sys.argv) > 2 else 160
skip = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else set()
out = []
last_sig = []
for m in pat.finditer(t):
    words = m.group(0).split()
    if words[0] in skip:
        continue
    if words[0] != 'اول' and not VALID2.match(words[1]):
        continue
    ctx = t[m.start():m.start() + W].replace('\n', ' ')
    sig = ctx[:90]
    if any(sig[:45] in s for s in last_sig[-40:]):
        continue
    last_sig.append(ctx)
    out.append(f"@{m.start()} {ctx}")
print('\n'.join(out))
