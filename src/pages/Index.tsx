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

const Index = () => {
  const [points, setPoints] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

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

  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});

  const handlePlanetClick = () => {
    const newPoints = points + clickPower;
    setPoints(newPoints);
    setTotalClicks(prev => prev + 1);
    
    // Обновляем прогресс миссий
    setMissions(prev => prev.map(mission => {
      if (mission.completed) return mission;
      
      let newProgress = mission.progress;
      if (mission.id === 'clicks10') {
        newProgress = Math.min(totalClicks + 1, mission.target);
      } else if (mission.id === 'points100') {
        newProgress = Math.min(newPoints, mission.target);
      }
      
      return {
        ...mission,
        progress: newProgress,
        completed: newProgress >= mission.target
      };
    }));

    // Создаем эффект частиц
    createClickParticle();
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

    if (upgradeId === 'rocket' || upgradeId === 'fleet') {
      setClickPower(prev => prev + upgrade.multiplier);
    } else {
      setPassiveIncome(prev => prev + upgrade.multiplier);
    }

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
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
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
                    className="w-full h-full object-cover rounded-full glow-effect"
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;