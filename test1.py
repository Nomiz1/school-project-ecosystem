import pygame
import numpy as np
import random

pygame.init()
screen = pygame.display.set_mode((800, 600))
Clock = pygame.time.Clock()


class grass:
    grass_positions = []
    for _ in range(100):
        x = random.randint(0, 800)
        y = random.randint(0, 600)
        grass_positions.append((x, y))

    grass_size = []
    for _ in range(100):
        height = random.randint(10, 15)
        width = random.randint(3, 5)
        size = (width, height)
        grass_size.append(size)
    

class rabbit:
    
    rabbit_attributes = {
        "color": (255, 255, 255),
        "speed": random.randint(1, 3)
    }
    
    rabbit_position = []
    for _ in range(10):
        x = random.randint(0, 800)
        y = random.randint(0, 600)
        rabbit_position.append([x, y])

    rabbit_size = []
    for _ in range(10):
        height = random.randint(20, 30)
        width = random.randint(15, 25)
        size = (width, height)
        rabbit_size.append(size)
    
   
    

    @classmethod
    def move(cls):
        for pos in cls.rabbit_position:
            def distance_to_grass(g):
                return (g[0] - pos[0])**2 + (g[1] - pos[1])**2
            nearest = min(grass.grass_positions, key=distance_to_grass)
            dx = nearest[0] - pos[0]
            dy = nearest[1] - pos[1]
            distance = (dx**2 + dy**2) ** 0.5
            if distance > 0:
                pos[0] += int(dx / distance * cls.rabbit_attributes["speed"])
                pos[1] += int(dy / distance * cls.rabbit_attributes["speed"])
    
    @classmethod
    def eat(cls):
        for pos in cls.rabbit_position:
            for i, g_pos in enumerate(grass.grass_positions):
                if abs(pos[0] - g_pos[0]) < 5 and abs(pos[1] - g_pos[1]) < 5:
                    grass.grass_positions.pop(i)
                    grass.grass_size.pop(i)
                    break


   

    

background = pygame.Surface((800, 600))
background.fill((150, 75, 0))
for pos, size in zip(grass.grass_positions, grass.grass_size):
    pygame.draw.rect(background, (0, 255, 0), (*pos, *size))

def update_background():
    background.fill((150, 75, 0))
    for pos, size in zip(grass.grass_positions, grass.grass_size):
        pygame.draw.rect(background, (0, 255, 0), (*pos, *size))

def draw_loop():
    screen.blit(background, (0, 0))
    for pos, size in zip(rabbit.rabbit_position, rabbit.rabbit_size):
        pygame.draw.rect(screen, rabbit.rabbit_color, (*pos, *size))

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()

    prev_grass_count = len(grass.grass_positions)
    rabbit.move()
    rabbit.eat()
    if len(grass.grass_positions) != prev_grass_count:
        update_background()
    draw_loop()
    pygame.display.update()
    Clock.tick(60)  
