import json, re, os
A = {r['n']: r['text'] for r in json.load(open('src/A_fixed.json', encoding='utf-8'))}
B = {r['n']: r['text'] for r in json.load(open('src/B_fixed.json', encoding='utf-8'))}
def rng(doc, a, b):
    return '\n'.join(doc[n] for n in range(a, b + 1) if n in doc and doc[n].strip())
# (id, title_ar, title_en, source, start, end)
COURSES = [
 ('C01','اسرار الكاريزما والجاذبيه الشخصيه','Secrets of Charisma & Personal Attraction','A',1,3),
 ('C02','مهارات التواصل الفعال','Effective Communication Skills','A',4,155),
 ('C03','كيف تدير مديرك','How to Manage Your Manager','A',156,157),
 ('C04','التعافي بعد الفقد','Recovering After Loss','A',158,161),
 ('C05','الذكاء العاطفي وفنون اداره الانفعالات','Emotional Intelligence & Managing Emotions','A',162,163),
 ('C06','القياده بالالهام وبناء الشخصيه القياديه','Inspirational Leadership','A',164,165),
 ('C07','رفع الكفاءه المهنيه','Raising Professional Competence','A',166,174),
 ('C08','فن الهيبه وقوه الشخصيه','The Art of Presence (Haiba) & Strong Personality','A',175,384),
 ('C09','التربيه وبناء شخصيه الطفل','Parenting & Building a Child\'s Personality','A',385,534),
 ('C10','مبادئ تاسيس ونجاح المشاريع','Principles of Starting & Growing a Business','A',535,668),
 ('C11','رفع تقدير الذات والثقه بالنفس','Self-Esteem & Self-Confidence','A',669,702),
 ('C12','تحقيق الاهداف بذكاء','Achieving Goals Smartly','B',1,152),
 ('C13','التحرر من الخوف والهشاشه','Freedom from Fear & Fragility','B',153,213),
 ('C14','مهاره التفاوض والاقناع','Negotiation & Persuasion','B',214,329),
 ('C15','قوه التركيز وتنظيم الشتات الفكري','The Power of Focus','B',330,369),
 ('C16','التعامل مع مختلف انواع الشخصيات','Dealing with Different Personalities','B',370,411),
 ('C17','قوه الابهار','The Power of Impressing (Wow Factor)','B',412,431),
 ('C18','قوه الافكار الملهمه','The Power of Inspiring Ideas','B',453,467),
 ('C19','قوه الشخصيه','Strength of Personality','B',484,604),
 ('C20','التحفيز وادارة الاولويات','Self-Motivation & Priorities','B',605,611),
 ('C21','اسرار الارتقاء الوظيفي','Secrets of Career Advancement','B',612,700),
]
meta = []
for cid, ar, en, src, a, b in COURSES:
    doc = A if src == 'A' else B
    txt = rng(doc, a, b)
    open(f'courses/{cid}.txt', 'w', encoding='utf-8').write(txt)
    meta.append({'id': cid, 'ar': ar, 'en': en, 'src': src, 'lines': [a, b], 'chars': len(txt)})
    print(cid, src, a, b, len(txt), en)
json.dump(meta, open('courses/meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
