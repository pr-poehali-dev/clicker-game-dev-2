import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  owned: number;
  icon: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
}

const Index = () => {
  const [points, setPoints] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievementPopup, setAchievementPopup] = useState<Achievement | null>(null);
  const [floatingStars, setFloatingStars] = useState<{x: number, y: number, id: number}[]>([]);
  const [nextStarId, setNextStarId] = useState(0);

  const [upgrades] = useState<Upgrade[]>([
    {
      id: 'rocket',
      name: 'Космический корабль',
      description: 'Увеличивает силу клика в 2 раза',
      cost: 15,
      multiplier: 2,
      owned: 0,
      icon: 'Rocket'
    },
    {
      id: 'satellite',
      name: 'Орбитальный спутник', 
      description: 'Генерирует 1 очко в секунду',
      cost: 100,
      multiplier: 1,
      owned: 0,
      icon: 'Satellite'
    },
    {
      id: 'station',
      name: 'Космическая станция',
      description: 'Генерирует 5 очков в секунду',
      cost: 500,
      multiplier: 5,
      owned: 0,
      icon: 'Building'
    },
    {
      id: 'fleet',
      name: 'Звездный флот',
      description: 'Увеличивает силу клика в 10 раз',
      cost: 2000,
      multiplier: 10,
      owned: 0,
      icon: 'Zap'
    }
  ]);

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'clicks10',
      title: 'Первые шаги',
      description: 'Сделай 10 кликов',
      target: 10,
      progress: 0,
      reward: 50,
      completed: false,
      icon: 'MousePointer'
    },
    {
      id: 'points100',
      title: 'Коллекционер звезд',
      description: 'Набери 100 очков',
      target: 100,
      progress: 0,
      reward: 200,
      completed: false,
      icon: 'Star'
    },
    {
      id: 'upgrade1',
      title: 'Первое улучшение',
      description: 'Купи любое улучшение',
      target: 1,
      progress: 0,
      reward: 300,
      completed: false,
      icon: 'ShoppingCart'
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_click',
      title: 'Первый контакт',
      description: 'Совершите первый клик по планете',
      unlocked: false,
      icon: 'MousePointer',
      rarity: 'common'
    },
    {
      id: 'click_master',
      title: 'Мастер кликов',
      description: 'Совершите 100 кликов',
      unlocked: false,
      icon: 'Zap',
      rarity: 'rare'
    },
    {
      id: 'energy_collector',
      title: 'Коллекционер энергии',
      description: 'Наберите 1000 единиц звездной энергии',
      unlocked: false,
      icon: 'Battery',
      rarity: 'epic'
    },
    {
      id: 'upgrade_enthusiast',
      title: 'Энтузиаст улучшений',
      description: 'Купите 5 улучшений',
      unlocked: false,
      icon: 'TrendingUp',
      rarity: 'rare'
    },
    {
      id: 'space_tycoon',
      title: 'Космический магнат',
      description: 'Наберите 10000 единиц энергии',
      unlocked: false,
      icon: 'Crown',
      rarity: 'legendary'
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { name: 'Cosmic Pioneer', score: 15420, rank: 1 },
    { name: 'Star Navigator', score: 12850, rank: 2 },
    { name: 'Galaxy Explorer', score: 9630, rank: 3 },
    { name: 'Space Cadet', score: 7250, rank: 4 },
    { name: 'Meteor Hunter', score: 5890, rank: 5 }
  ]);

  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});

  const playSound = (type: 'click' | 'purchase' | 'achievement') => {
    if (!soundEnabled) return;
    
    // Создаем простые звуки через Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'click') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'purchase') {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'achievement') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const checkAchievements = (newPoints: number, newClicks: number, totalUpgrades: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_click':
          shouldUnlock = newClicks >= 1;
          break;
        case 'click_master':
          shouldUnlock = newClicks >= 100;
          break;
        case 'energy_collector':
          shouldUnlock = newPoints >= 1000;
          break;
        case 'upgrade_enthusiast':
          shouldUnlock = totalUpgrades >= 5;
          break;
        case 'space_tycoon':
          shouldUnlock = newPoints >= 10000;
          break;
      }
      
      if (shouldUnlock) {
        setAchievementPopup(achievement);
        playSound('achievement');
        setTimeout(() => setAchievementPopup(null), 3000);
      }
      
      return {
        ...achievement,
        unlocked: shouldUnlock || achievement.unlocked
      };
    }));
  };

  const handlePlanetClick = () => {
    const newPoints = points + clickPower;
    const newClicks = totalClicks + 1;
    setPoints(newPoints);
    setTotalClicks(newClicks);
    
    playSound('click');
    
    // Обновляем прогресс миссий
    setMissions(prev => prev.map(mission => {
      if (mission.completed) return mission;
      
      let newProgress = mission.progress;
      if (mission.id === 'clicks10') {
        newProgress = Math.min(newClicks, mission.target);
      } else if (mission.id === 'points100') {
        newProgress = Math.min(newPoints, mission.target);
      }
      
      return {
        ...mission,
        progress: newProgress,
        completed: newProgress >= mission.target
      };
    }));

    // Проверяем достижения
    checkAchievements(newPoints, newClicks, Object.values(ownedUpgrades).reduce((a, b) => a + b, 0));

    // Создаем эффект частиц и звезд
    createClickParticle();
    createFloatingStar();
  };

  const createClickParticle = () => {
    const planetElement = document.getElementById('planet-clicker');
    if (!planetElement) return;

    const particle = document.createElement('div');
    particle.innerHTML = '+' + clickPower;
    particle.className = 'absolute text-accent font-bold text-xl pointer-events-none animate-bounce';
    particle.style.left = Math.random() * 100 + 'px';
    particle.style.top = Math.random() * 100 + 'px';
    
    planetElement.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1000);
  };

  const createFloatingStar = () => {
    const newStar = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      id: nextStarId
    };
    
    setFloatingStars(prev => [...prev, newStar]);
    setNextStarId(prev => prev + 1);
    
    // Удаляем звезду через 3 секунды
    setTimeout(() => {
      setFloatingStars(prev => prev.filter(star => star.id !== newStar.id));
    }, 3000);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || points < upgrade.cost) return;

    const currentOwned = ownedUpgrades[upgradeId] || 0;
    const newCost = Math.floor(upgrade.cost * Math.pow(1.15, currentOwned));
    
    if (points < newCost) return;

    setPoints(prev => prev - newCost);
    setOwnedUpgrades(prev => ({
      ...prev,
      [upgradeId]: currentOwned + 1
    }));

    playSound('purchase');

    if (upgradeId === 'rocket' || upgradeId === 'fleet') {
      setClickPower(prev => prev + upgrade.multiplier);
    } else {
      setPassiveIncome(prev => prev + upgrade.multiplier);
    }
    
    // Проверяем достижения после покупки
    const totalUpgrades = Object.values({...ownedUpgrades, [upgradeId]: currentOwned + 1}).reduce((a, b) => a + b, 0);
    checkAchievements(points - newCost, totalClicks, totalUpgrades);

    // Обновляем миссию покупки улучшения
    setMissions(prev => prev.map(mission => {
      if (mission.id === 'upgrade1' && !mission.completed) {
        return {
          ...mission,
          progress: 1,
          completed: true
        };
      }
      return mission;
    }));
  };

  const claimMissionReward = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !mission.completed) return;

    setPoints(prev => prev + mission.reward);
    setMissions(prev => prev.filter(m => m.id !== missionId));
  };

  // Пассивный доход
  useEffect(() => {
    if (passiveIncome === 0) return;
    
    const interval = setInterval(() => {
      setPoints(prev => prev + passiveIncome);
    }, 1000);

    return () => clearInterval(interval);
  }, [passiveIncome]);

  const getUpgradeCost = (upgrade: Upgrade) => {
    const owned = ownedUpgrades[upgrade.id] || 0;
    return Math.floor(upgrade.cost * Math.pow(1.15, owned));
  };

  return (
    <div className="min-h-screen space-bg">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text cosmic-gradient mb-4">
            SPACE CLICKER
          </h1>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{Math.floor(points)}</div>
              <div className="text-sm text-muted-foreground">Звездная энергия</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-primary">{clickPower}</div>
              <div className="text-xs text-muted-foreground">Сила клика</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-secondary-foreground">{passiveIncome}/сек</div>
              <div className="text-xs text-muted-foreground">Доход</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto mb-8">
            <TabsTrigger value="game" className="flex items-center gap-2">
              <Icon name="Gamepad2" size={16} />
              Игра
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Icon name="ShoppingBag" size={16} />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2">
              <Icon name="Target" size={16} />
              Миссии
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Icon name="Trophy" size={16} />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          {/* Игровая зона */}
          <TabsContent value="game" className="space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div 
                  id="planet-clicker"
                  className="relative w-64 h-64 md:w-80 md:h-80 cursor-pointer click-animation pulse-glow"
                  onClick={handlePlanetClick}
                >
                  <img 
                    src="/img/4e4a8e49-cfcd-4ba4-875c-8129016b07b4.jpg"
                    alt="Cosmic Planet"
                    className="w-full h-full object-cover rounded-full glow-effect rotate-planet"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-lg font-bold text-center bg-black/50 rounded-lg px-4 py-2">
                      КЛИК!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Всего кликов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalClicks}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Энергия в секунду</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{passiveIncome}</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Улучшений куплено</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary-foreground">
                    {Object.values(ownedUpgrades).reduce((a, b) => a + b, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Миссий выполнено</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {missions.filter(m => m.completed).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Магазин */}
          <TabsContent value="shop" className="space-y-4">
            <div className="grid gap-4 max-w-2xl mx-auto">
              {upgrades.map(upgrade => {
                const cost = getUpgradeCost(upgrade);
                const owned = ownedUpgrades[upgrade.id] || 0;
                const canAfford = points >= cost;

                return (
                  <Card key={upgrade.id} className={`transition-all ${canAfford ? 'glow-effect' : 'opacity-60'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon name={upgrade.icon as any} size={24} className="text-primary" />
                          <div>
                            <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                          </div>
                        </div>
                        {owned > 0 && (
                          <Badge variant="secondary">{owned}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-accent">{cost} ⭐</div>
                        <Button 
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className="cosmic-gradient text-background font-semibold"
                        >
                          Купить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Миссии */}
          <TabsContent value="missions" className="space-y-4">
            <div className="grid gap-4 max-w-2xl mx-auto">
              {missions.map(mission => (
                <Card key={mission.id} className={mission.completed ? 'glow-effect' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name={mission.icon as any} size={24} className="text-primary" />
                        <div>
                          <CardTitle className="text-lg">{mission.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{mission.description}</p>
                        </div>
                      </div>
                      <Badge variant={mission.completed ? "default" : "secondary"}>
                        {mission.completed ? 'Выполнено' : 'В процессе'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Прогресс: {mission.progress}/{mission.target}</span>
                        <span className="text-accent">{Math.floor((mission.progress / mission.target) * 100)}%</span>
                      </div>
                      <Progress value={(mission.progress / mission.target) * 100} className="w-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-accent">Награда: {mission.reward} ⭐</div>
                      {mission.completed && (
                        <Button 
                          onClick={() => claimMissionReward(mission.id)}
                          className="cosmic-gradient text-background font-semibold"
                        >
                          Получить
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Достижения */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary">Достижения</h3>
                <div className="text-sm text-muted-foreground">
                  {achievements.filter(a => a.unlocked).length} из {achievements.length}
                </div>
              </div>
              {achievements.map(achievement => {
                const getRarityColor = (rarity: string) => {
                  switch (rarity) {
                    case 'common': return 'text-gray-400';
                    case 'rare': return 'text-blue-400';
                    case 'epic': return 'text-purple-400';
                    case 'legendary': return 'text-yellow-400';
                    default: return 'text-gray-400';
                  }
                };
                
                return (
                  <Card key={achievement.id} className={`transition-all ${
                    achievement.unlocked ? 'glow-effect' : 'opacity-50'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon 
                            name={achievement.icon as any} 
                            size={24} 
                            className={achievement.unlocked ? 'text-primary' : 'text-gray-500'} 
                          />
                          <div>
                            <CardTitle className="text-lg">{achievement.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge 
                            variant={achievement.unlocked ? "default" : "secondary"}
                            className={getRarityColor(achievement.rarity)}
                          >
                            {achievement.rarity}
                          </Badge>
                          {achievement.unlocked && (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              Выполнено
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Рейтинг */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">Таблица лидеров</h3>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="text-center">
                      <div className="text-lg text-muted-foreground">Ваш рекорд</div>
                      <div className="text-3xl font-bold text-accent">{Math.floor(points)}</div>
                      <div className="text-sm text-muted-foreground">#{leaderboard.findIndex(entry => entry.score < points) + 1 || leaderboard.length + 1} место</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-amber-600 text-black' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {entry.rank}
                          </div>
                          <div className="font-medium">{entry.name}</div>
                        </div>
                        <div className="font-bold text-accent">{entry.score.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Плавающие звезды */}
        {floatingStars.map(star => (
          <div
            key={star.id}
            className="fixed pointer-events-none star-twinkle z-10"
            style={{
              left: star.x,
              top: star.y,
              fontSize: '20px'
            }}
          >
            ⭐
          </div>
        ))}
        
        {/* Попап достижения */}
        {achievementPopup && (
          <div className="fixed top-4 right-4 z-50 achievement-popup">
            <Card className="glow-effect border-yellow-400">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Trophy" size={20} className="text-yellow-400" />
                  <div className="text-sm font-bold text-yellow-400">ДОСТИЖЕНИЕ ПОЛУЧЕНО!</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon name={achievementPopup.icon as any} size={24} className="text-primary" />
                  <div>
                    <div className="font-bold">{achievementPopup.title}</div>
                    <div className="text-xs text-muted-foreground">{achievementPopup.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Настройки звука */}
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2"
          >
            <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={16} />
            {soundEnabled ? 'Вкл' : 'Выкл'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;