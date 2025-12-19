import React, { useState, useMemo } from 'react';
import { Search, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { abilityNameMap } from './abilityNames';

// Descriptions des abilities
const ABILITY_DESCRIPTIONS = Object.fromEntries(
  Object.entries(abilityNameMap).map(([id, data]) => [id, data.description])
);

// Données importées depuis items.ts - exemple minimal
const itemsData = {};

// Cartographie des interactions : quelles abilities réagissent à chaque trigger
const ABILITY_INTERACTIONS = {
  // Lightning triggers
  'LightningOnAttack': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnCrit': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnTurnStart': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnRage': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnEnemyDeath': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnShieldActivate': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningEveryHitCount': ['HealOnLightning', 'AddRageOnLightning'],
  'LightningOnHitCount': ['HealOnLightning', 'AddRageOnLightning'],
  'DoubleLightningOnTurn': ['HealOnLightning', 'AddRageOnLightning'],
  
  // Magic Knife triggers
  'MagicKnifeAbility': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeOnRage': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeOnCrit': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeOnHitCount': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeOnEnemyDeath': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'KnifeOnAttack': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeEveryHitCount': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'MagicKnifeOnTurn': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'LowHPKnives': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'KnifeDoubler': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  
  // Fire Knife triggers
  'FireKnifeOnTurnStart': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'FireKnifeOnAttack': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  
  // Ice Knife triggers
  'IceKnifeOnTurnStart': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  'IceKnifeOnAttack': ['AddRageOnMagicKnife', 'HealOnMagicKnife'],
  
  // Enemy Death triggers
  'HealOnEnemyDeath': ['AddRageOnEnemyDeath', 'GainShieldOnEnemyDeath'],
  'GainShieldOnEnemyDeath': ['AddRageOnEnemyDeath'],
  'AddRageOnEnemyDeath': ['GainShieldOnEnemyDeath', 'HealOnEnemyDeath'],
  
  // Rage triggers
  'HealOnRage': ['AddRageOnHeal', 'GainShieldOnRage'],
  'RageOnFirstTurn': ['HealOnRage', 'GainShieldOnRage'],
  'LowHPRageFill': ['HealOnRage', 'GainShieldOnRage'],
  'BonusRageOnAttack': ['HealOnRage', 'GainShieldOnRage'],
  'AddRageOnCrit': ['HealOnRage', 'GainShieldOnRage'],
  'GainShieldOnRage': [],
  
  // Crit triggers
  'HealOnCritAbility': ['AddRageOnCrit'],
  
  // Shield interactions
  'ShieldOnLowHP': ['LowHPRageFill', 'LowHPCritBoostAbility', 'LowHpDodgeBoostAbility'],
  'GainShieldOnHitCount': ['AddRageOnHitCount'],
  'GainShieldOnTurn': [],
  
  // Heal triggers
  'HealOnMagicKnife': [],
  'HealOnLightning': [],
  'HealOnFirstTurn': [],
  'SecondWindAbility': ['AddRageOnHeal'],
  'HealEveryHitCount': ['AddRageOnHeal'],
  'HealOnHitCount': ['AddRageOnHeal'],
  'LifeStealOnAttack': ['AddRageOnHeal'],
  
  // HP condition abilities (ces abilities réagissent à des conditions)
  'LowHpDodgeBoostAbility': [],
  'LowHpCritBoostAbility': [],
  'MaxHpCritBoostAbility': [],
  'BoostAttackOnHighHP': [],
  'LowHPBoostDefense': [],
  
  // Other triggers
  'EveryOtherTurnDoubleAttack': [],
  'EveryOtherTurnAddRage': [],
  'AddRageOnDamage': [],
  'AddRageOnHeal': [],
  'TripleAttack': [],
  'HealChanceOnShadowDamage': ['AddRageOnHeal'],
  'AddRageOnHitCount': [],
  'AddRageOnLightning': [],
};

const InteractionSystem = ({ items = itemsData }) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const getItemType = (item) => {
    let type = item.equipSlots?.[0]?.toLowerCase();
    if (!type) {
      const specificTag = item.tags?.find(t => t.toLowerCase() !== 'equipment');
      type = specificTag?.toLowerCase() || item.tags?.[0]?.toLowerCase() || 'other';
    }
    return type;
  };

  const itemsArray = useMemo(() => {
    return Object.entries(items).map(([id, item]) => ({
      id,
      ...item,
    }));
  }, [items]);

  const filteredItems = useMemo(() => {
    return itemsArray.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [itemsArray, searchTerm]);

  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const type = getItemType(item);
      
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
    });

    const categoriesToRemove = ['map', 'material', 'blueprint', 'currency'];
    for (const category of categoriesToRemove) {
      delete groups[category];
    }

    return groups;
  }, [filteredItems]);

  const getItemAbilities = (item) => {
    return item.abilities ? (Array.isArray(item.abilities) ? item.abilities : [item.abilities]) : [];
  };

  const interactions = useMemo(() => {
    const selectedItem = itemsArray.find(i => i.id === selectedItemId);
    if (!selectedItem) return null;

    const itemAbilities = getItemAbilities(selectedItem);
    if (itemAbilities.length === 0) return null;

    const interactions = {
      producers: [],
      reactors: [],
    };

    const abilityIds = itemAbilities.map(a => a.id);

    itemsArray.forEach((item) => {
      if (item.id === selectedItemId) return;

      const itemAbilities = getItemAbilities(item);
      const itemAbilityIds = itemAbilities.map(a => a.id);

      // Produit les mêmes abilities
      if (abilityIds.some(aId => itemAbilityIds.includes(aId))) {
        interactions.producers.push(item);
      }

      // Réagit aux abilities du item sélectionné
      abilityIds.forEach(abilityId => {
        const reactingAbilities = ABILITY_INTERACTIONS[abilityId] || [];
        if (reactingAbilities.some(rId => itemAbilityIds.includes(rId))) {
          if (!interactions.reactors.find(i => i.id === item.id)) {
            interactions.reactors.push(item);
          }
        }
      });
    });

    return interactions;
  }, [selectedItemId, itemsArray]);

  const selectedItem = useMemo(() => {
    return itemsArray.find(i => i.id === selectedItemId);
  }, [selectedItemId, itemsArray]);

  const toggleCategory = (type) => {
    setExpandedCategory(expandedCategory === type ? null : type);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
    };
    return colors[rarity] || colors.common;
  };

  const getTagIcon = (tag) => {
    const icons = {
      equipment: '⚔️',
      weapon: '🗡️',
      armor: '🛡️',
      ring: '💍',
      amulet: '✨',
      belt: '🎀',
      chest: '👕',
      head: '👤',
      other: '📦',
    };
    return icons[tag] || icons.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-amber-400" />
            Sword & Supper - Interaction Explorer
          </h1>
          <p className="text-slate-400">
            Discover which items interact with each other
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de sélection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search for an item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(groupedItems).map(([type, typeItems]) => (
                <div key={type} className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(type)}
                    className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 transition flex items-center justify-between"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-xl">{getTagIcon(type)}</span>
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({typeItems.length})
                    </span>
                    {expandedCategory === type ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {expandedCategory === type && (
                    <div className="bg-slate-800 border-t border-slate-600">
                      {typeItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`w-full text-left px-4 py-2 transition border-b border-slate-700 last:border-b-0 ${
                            selectedItemId === item.id
                              ? 'bg-amber-600 text-white'
                              : 'hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.assetName ? (
                              <img src={`${import.meta.env.BASE_URL}itemIcons/${item.assetName}.png`} alt={item.name} className="w-8 h-8" />
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center text-xl">{getTagIcon(getItemType(item))}</span>
                            )}
                            <div className={`font-medium ${getRarityColor(item.rarity)}`}>
                              {item.name}
                            </div>
                          </div>
                          {getItemAbilities(item).length > 0 && (
                            <div className="text-xs text-slate-400 mt-1">
                              {getItemAbilities(item).map(a => (
                                <div key={a.id} className="text-slate-500 italic text-xs">
                                  {a.id}: {ABILITY_DESCRIPTIONS[a.id] || 'Pas de description'}
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel d'interactions */}
          <div className="lg:col-span-2">
            {!selectedItem ? (
              <div className="h-full flex items-center justify-center bg-slate-800 border border-slate-600 rounded-lg">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Select an item to see its interactions</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Objet sélectionné */}
                <div className={`rounded-lg p-6 border bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className={`text-2xl font-bold ${getRarityColor(selectedItem.rarity)}`}>
                        {selectedItem.name}
                      </h2>
                      <p className="text-amber-100 text-sm mt-1">{selectedItem.id}</p>
                      <div className="mt-2 text-amber-100 text-sm space-y-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {selectedItem.damage && (
                                <div>
                                    <strong>Damage:</strong> {Object.entries(selectedItem.damage).map(([type, val]) => `${type}: ${val}`).join(', ')}
                                </div>
                            )}
                            {selectedItem.requiredLevel > 1 && (
                                <div>
                                    <strong>Required Level:</strong> {selectedItem.requiredLevel}
                                </div>
                            )}
                        </div>
                        {selectedItem.statModifiers && selectedItem.statModifiers.length > 0 && (
                            <div>
                                <strong>Stat Modifiers:</strong>
                                <ul className="flex flex-wrap gap-x-4 gap-y-1 ml-2">
                                    {selectedItem.statModifiers.map((mod, index) => (
                                        <li key={index} className="list-inside list-disc">{mod.stat}: {mod.value > 0 ? `+${mod.value}` : mod.value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>
                    </div>
                    {selectedItem.assetName ? (
                      <img src={`${import.meta.env.BASE_URL}itemIcons/${selectedItem.assetName}.png`} alt={selectedItem.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <span className="text-3xl">{getTagIcon(getItemType(selectedItem))}</span>
                    )}
                  </div>

                  {/* Abilities */}
                  {getItemAbilities(selectedItem).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-500">
                      <p className="text-sm font-semibold text-amber-100 mb-2">Abilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {getItemAbilities(selectedItem).map((ability) => (
                          <div
                            key={ability.id}
                            className="bg-amber-500 text-amber-900 px-3 py-2 rounded text-sm font-medium"
                          >
                            <div className="font-bold">✨ {ability.id}</div>
                            <div className="text-xs mt-1 text-amber-800">
                              {ABILITY_DESCRIPTIONS[ability.id] || 'Pas de description'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactions */}
                {interactions && (
                  <div className="space-y-4">
                    {/* Réacteurs */}
                    {interactions.reactors.length > 0 && (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-400" />
                          Items that react to this item ({interactions.reactors.length})
                        </h3>
                        <div className="space-y-2">
                          {interactions.reactors.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItemId(item.id)}
                              className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition border-l-4 border-green-400"
                            >
                              <div className={`font-semibold flex items-center gap-2 ${getRarityColor(item.rarity)}`}>
                                                                {item.assetName ? (
                                  <img src={`${import.meta.env.BASE_URL}itemIcons/${item.assetName}.png`} alt={item.name} className="w-8 h-8 object-contain mr-2" />
                                ) : (
                                  <span>{getTagIcon(getItemType(item))}</span>
                                )}
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-400 mt-1 space-y-1">
                                {getItemAbilities(item).map(a => (
                                  <div key={a.id} className="text-xs space-y-1">
                                    <span className="font-mono bg-slate-600 px-1 rounded">{a.id}</span>
                                    <p className="text-slate-500 italic">{ABILITY_DESCRIPTIONS[a.id] || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Producteurs */}
                    {interactions.producers.length > 0 && (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          Items with the same abilities ({interactions.producers.length})
                        </h3>
                        <div className="space-y-2">
                          {interactions.producers.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItemId(item.id)}
                              className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition border-l-4 border-blue-400"
                            >
                              <div className={`font-semibold flex items-center gap-2 ${getRarityColor(item.rarity)}`}>
                                                                {item.assetName ? (
                                  <img src={`${import.meta.env.BASE_URL}itemIcons/${item.assetName}.png`} alt={item.name} className="w-8 h-8 object-contain mr-2" />
                                ) : (
                                  <span>{getTagIcon(getItemType(item))}</span>
                                )}
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-400 mt-1 space-y-1">
                                {getItemAbilities(item).map(a => (
                                  <div key={a.id} className="text-xs space-y-1">
                                    <span className="font-mono bg-slate-600 px-1 rounded">{a.id}</span>
                                    <p className="text-slate-500 italic">{ABILITY_DESCRIPTIONS[a.id] || 'No description'}</p>
                                  </div>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-sm text-slate-300 space-y-2">
                      <div className="flex gap-2">
                        <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-green-400">Reactors:</span> Items whose abilities react to this one's abilities
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-blue-400">Producers:</span> Items that have the same abilities as this one
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionSystem;
