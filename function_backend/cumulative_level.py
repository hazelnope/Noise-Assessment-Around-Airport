Day_Delta_i = 0
Night_Delta_i = 10

def Cumulative_model(DN, sound, duration_day ,duration_night):
    if DN == 'night':
        return duration_night * (10**( (sound + Night_Delta_i) / 10 ))
    elif DN == 'day':
        return duration_day * (10**( (sound + Day_Delta_i) / 10 ))
    else:
        return 0