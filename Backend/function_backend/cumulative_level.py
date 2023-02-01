Day_Delta_i = 0
Night_Delta_i = 10

def Cumulative_model(DN, sound):
    if DN == 'night':
        return 3 * (10**( (sound + Night_Delta_i) / 10 ))
    elif DN == 'day':
        return 3 * (10**( (sound + Day_Delta_i) / 10 ))
    else:
        return 0