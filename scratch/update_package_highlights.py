import re

pkg_file = r'src/data/packages.ts'
with open(pkg_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Define precise highlight enhancements for packages according to user specifications:

updates = {
    'shirdi-tour-5-days': {
        'highlights': [
            "ஷீரடி (Shirdi)", "பண்டரிபுரம் (Pandharpur)", "மந்திராலயம் (Mantralayam)", 
            "சனி சிங்கனாபூர் (Shani Shingnapur)", "எல்லோரா குஸ்நேஸ்வர் ஜோதிர்லிங்கம் (Ellora Grishneshwar)", 
            "சோலாப்பூர் சித்தேஸ்வரர் கோவில் (Solapur Siddheshwar Temple)", "மினி தாிழமை (Bibi Ka Maqbara)", 
            "அவுரங்காபாத் (Aurangabad)"
        ]
    },
    'kasi-tour-11-days': {
        'highlights': [
            "கயா (Gaya)", "புத்தகயா (Bodh Gaya)", "சித்ரகூட் (Chitrakoot)", 
            "திரிவேணி சங்கமம் (Triveni Sangam)", "மதுரா (Mathura)", "பிருந்தாவனம் (Vrindavan)", 
            "அயோத்தி (Ayodhya)", "ஆக்ரா (Agra)", "டெல்லி (Delhi)", "வாரணாசி / காசி (Kashi)"
        ]
    },
    'kasi-tour-16-days': {
        'highlights': [
            "கயா (Gaya)", "புத்தகயா (Bodh Gaya)", "சித்ரகூட் (Chitrakoot)", "மதுரா (Mathura)", 
            "ஆக்ரா (Agra)", "டெல்லி (Delhi)", "ஹரித்துவார் (Haridwar)", "ரிஷிகேஷ் (Rishikesh)", 
            "அமிர்தசரஸ் (Amritsar)", "நைமிசாரண்யம் (Naimisharanya)", "வாகா பார்டர் (Wagah Border)", 
            "குருக்ஷேத்திரம் (Kurukshetra)", "அயோத்தி (Ayodhya)", "திரிவேணி சங்கமம் (Triveni Sangam)", 
            "பிருந்தாவனம் (Vrindavan)", "காசி (Kashi)"
        ]
    },
    'pancha-dwaraka-15-days': {
        'highlights': [
            "குஜராத் (Gujarat)", "ராஜஸ்தான் (Rajasthan)", "புஷ்கர் (Pushkar)", 
            "படேல் சிலை (Statue of Unity)", "துவாரகா (Dwarka)", "ஜெய்ப்பூர் (Jaipur)", 
            "சோம்நாத் (Somnath)", "மவுண்ட் அபு (Mount Abu)", "மூன்று கடல் கோவில் (Triveni Sangam)", 
            "பாவ் நகர் (Bhavnagar)", "மாத்தூர் கயா (Mathur Gaya)", "நாகேஸ்வர் ஜோதிர்லிங்கம் (Nageshwar)", 
            "போர்பந்தர் - காந்தி பிறந்த வீடு (Porbandar)", "மாதருகயா (Matru Gaya)"
        ]
    },
    'rajasthan-tour-13-days': {
        'highlights': [
            "ஜெய்ப்பூர் (Jaipur)", "உதய்பூர் (Udaipur)", "ஜோத்பூர் (Jodhpur)", 
            "மவுண்ட் அபு (Mount Abu)", "எலி கோவில் (Karni Mata Temple)", "பிர்லா மந்திர் (Birla Mandir)", 
            "ஆம்பர் போர்ட் (Amber Fort)", "சிட்டி பேலஸ் (City Palace)", "கோல்டன் கோட்டை (Golden Fort / Jaisalmer)"
        ]
    },
    'nepal-tour-15-days': {
        'highlights': [
            "காசி (Kashi)", "அயோத்தி (Ayodhya)", "ஆக்ரா (Agra)", "முக்திநாத் (Muktinath)", 
            "நைமிசாரண்யம் (Naimisharanya)", "பசுபதிநாத் (Pashupatinath)", "ஜனக்பூர் (Janakpur)", 
            "மனகமனா தேவி (Manakamana Devi)", "லும்பினி (Lumbini)"
        ]
    },
    'kerala-tour-8-days': {
        'highlights': [
            "வாகமன் (Vagamon)", "ஆலப்புழா படகு இல்லம் (Alappuzha Houseboat)", 
            "அதிரப்பள்ளி நீர்வீழ்ச்சி (Athirappilly Waterfalls)", "கொச்சி (Kochi)", 
            "குருவாயூர் (Guruvayur)", "சோட்டானிக்கரை பகவதி அம்மன் கோவில் (Chottanikkara Temple)"
        ]
    },
    'ahobilam-tour-5-days': {
        'highlights': [
            "சிறுவாபுரி", "சுருட்டப்பள்ளி", "மஹாநந்தி", "ஸ்ரீசைலம்", "பெரியபாளையம்", 
            "அஹோபில நரசிம்மர்", "வராஹ நரசிம்மர்", "மாலோல நரசிம்மர்", "ஜ்வாலா நரசிம்மர்", 
            "பாவன நரசிம்மர்", "காரஞ்ச நரசிம்மர்", "பார்கவ நரசிம்மர்", "யோகானந்த நரசிம்மர்", "சக்ரவட நரசிம்மர்"
        ]
    },
    'kolkata-tour-11-days': {
        'highlights': [
            "கேங்டாக் (Gangtok)", "டார்ஜிலிங் (Darjeeling)", "பாபா மந்திர் (Baba Mandir)", 
            "பேலூர்மத் தக்ஷிணேஸ்வர் (Belur Math Dakshineswar)", "சிக்கிம் (Sikkim)", 
            "காளி கோவில் (Kalighat)", "அவுரா பிரிட்ஜ் (Howrah Bridge)", "விக்டோரியா மெமோரியல் (Victoria Memorial)"
        ]
    },
    'shimla-tour-14-days': {
        'highlights': [
            "சிம்லா (Shimla)", "குலு மணாலி (Kullu Manali)", "அமிர்தசரஸ் (Amritsar)", 
            "டெல்லி (Delhi)", "ஹரித்துவார் (Haridwar)", "ரிஷிகேஷ் (Rishikesh)", 
            "குருக்ஷேத்திரம் (Kurukshetra)", "ஆக்ரா (Agra)"
        ]
    },
    'kashmir-tour-14-days': {
        'highlights': [
            "ஜம்மு (Jammu)", "ஸ்ரீநகர் (Srinagar)", "அமிர்தசரஸ் (Amritsar)", "டெல்லி (Delhi)", 
            "வைஷ்ணவி தேவி (Vaishno Devi)", "வாகா பார்டர் (Wagah Border)", "சோனாமார்க் (Sonamarg)", 
            "குல்மார்க் (Gulmarg)"
        ]
    },
    'tamilnadu-tour-6-days': {
        'highlights': [
            "ஆறுபடை வீடு", "ராமேஸ்வரம்", "கன்னியாகுமரி", "ஸ்ரீரங்கம்", "ஸ்ரீவில்லிபுத்தூர்", "சமயபுரம்", "மதுரை மீனாட்சி அம்மன் கோவில்"
        ]
    },
    'navagraha-tour-3-days': {
        'highlights': [
            "திங்களூர் (சந்திரன்)", "கஞ்சனூர் (சுக்கிரன்)", "ஆலங்குடி (குரு)", 
            "சூரியனார் கோவில் (சூரியன்)", "திருநாகேஸ்வரம் (ராகு)", "திருநள்ளாறு (சனி)", 
            "கீழப்பெரும்பள்ளம் (கேது)", "திருவெண்காடு (புதன்)", "வைத்தீஸ்வரன் கோவில் (செவ்வாய்)"
        ]
    },
    'badrinath-tour-16-days': {
        'highlights': [
            "பத்ரிநாத்", "கேதார்நாத்", "கங்கோத்ரி", "யமுனோத்ரி", "ஹரித்துவார்", "ரிஷிகேஷ்"
        ]
    },
    'hyderabad-tour-5-days': {
        'highlights': [
            "லக்ஷ்மி நரசிம்மர் கோவில்", "சார்மினார்", "பிர்லா மந்திர்", "புத்தர் சிலை", 
            "லும்பினி பார்க்", "NTR கார்டன்", "இராமானுஜர் சமத்துவ சிலை", "உசேன் சாகர் லேக்", 
            "மியூசியம் மற்றும் விலங்கியல் பூங்கா"
        ]
    },
    'amarnath-tour-14-days': {
        'highlights': [
            "அமர்நாத்", "வைஷ்ணவிதேவி", "மஹாதேவ் தரிசனம்", "பொற்கோவில்", 
            "ஜாலியன் வாலாபாக்", "ஸ்ரீநகர்", "ஜம்மு"
        ]
    },
    'bangalore-dharmasthala-tour-7-days': {
        'highlights': [
            "மைசூர் சாமுண்டீஸ்வரி", "மைசூர் Zoo", "மைசூர் அரண்மனை", "தலைக்காவிரி", 
            "ஸ்ரீரங்கப்பட்டினம்", "திரிவேணி சங்கமம்", "மூகாம்பிகை (கொல்லூர்)", "உடுப்பி கிருஷ்ணர்", 
            "நேத்ராவதி நதி", "சுப்பிரமண்யா (குக்கே)", "முருடேஸ்வர்", "கோகர்ணம்", "தர்மஸ்தலா", 
            "லால்பாக்", "இஸ்கான் கோவில்"
        ]
    },
    'karnataka-tour-7-days': {
        'highlights': [
            "முகாம்பிகை (கொல்லூர்)", "உடுப்பி கிருஷ்ணர்", "நேத்ராவதி நதி", "சுப்பிரமண்யா (குக்கே)", 
            "முருடேஸ்வர்", "கோகர்ணம்", "தர்மஸ்தலா", "மங்களூர் கத்ரி மஞ்சுநாத சுவாமி கோவில்", "ஹொரநாடு அன்னபூரணி"
        ]
    }
}

for slug, data in updates.items():
    idx = content.find(f"slug: '{slug}'")
    if idx == -1:
        idx = content.find(f'slug: "{slug}"')
    if idx != -1:
        hl_start = content.find('highlights: [', idx)
        if hl_start != -1:
            hl_end = content.find('],', hl_start)
            if hl_end != -1:
                formatted_hl = 'highlights: [\n' + ',\n'.join([f"      '{h}'" for h in data['highlights']]) + '\n    ]'
                content = content[:hl_start] + formatted_hl + content[hl_end+1:]
                print(f"Updated highlights for {slug}")
            else:
                print(f"Could not find end of highlights for {slug}")
        else:
            print(f"Could not find highlights start for {slug}")
    else:
        print(f"Slug not found: {slug}")

with open(pkg_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished updating packages.ts!")
