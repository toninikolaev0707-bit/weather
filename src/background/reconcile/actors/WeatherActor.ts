import { buildEffect, Effect, isEffect, Item } from "@owlbear-rodeo/sdk";
import { Actor } from "../Actor";
import { Reconciler } from "../Reconciler";
import { WeatherConfig } from "../../../types/WeatherConfig";
import { getMetadata } from "../../../util/getMetadata";
import { getPluginId } from "../../../util/getPluginId";

import leafsautumn from "../../shaders/leafsautumn.frag";
import leafsgoldenpromax from "../../shaders/leafsgoldenpromax.frag";
import leafsgreen from "../../shaders/leafsgreen.frag";
import blizzard from "../../shaders/Blizzard.frag";
import auralines from "../../shaders/AuraLines.frag";
import snow from "../../shaders/snow.frag";
import rain from "../../shaders/rain.frag";
import fire from "../../shaders/fire.frag";
import sand from "../../shaders/sand.frag";
import cloud from "../../shaders/cloud.frag";
import bloom from "../../shaders/bloom.frag";

export class WeatherActor extends Actor {
  // ID of the current effect item
  private effect: string;
  constructor(reconciler: Reconciler, parent: Item) {
    super(reconciler);
    const item = this.parentToEffect(parent);
    this.effect = item.id;
    this.reconciler.patcher.addItems(item);
  }

  delete(): void {
    this.reconciler.patcher.deleteItems(this.effect);
  }

  update(parent: Item) {
    const config = getMetadata<WeatherConfig>(
      parent.metadata,
      getPluginId("weather"),
      { type: "SNOW" }
    );
    this.reconciler.patcher.updateItems([
      this.effect,
      (item) => {
        if (isEffect(item)) {
          this.applyWeatherConfig(item, config);
          this.applyWeatherLayer(item, parent);
        }
      },
    ]);
  }

  private parentToEffect(parent: Item) {
    const config = getMetadata<WeatherConfig>(
      parent.metadata,
      getPluginId("weather"),
      { type: "SNOW" }
    );
    const effect = buildEffect()
      .attachedTo(parent.id)
      .visible(parent.visible)
      .position(parent.position)
      .rotation(parent.rotation)
      .effectType("ATTACHMENT")
      .locked(true)
      .disableHit(true)
      .disableAttachmentBehavior(["COPY"])
      .disableAutoZIndex(true)
      .build();

    this.applyWeatherConfig(effect, config);
    this.applyWeatherLayer(effect, parent);

    return effect;
  }

  private getSkslFromConfig(config: WeatherConfig) {
    if (config.type === "RAIN") {
      return rain;
    } else if (config.type === "LEAFSGOLDENPROMAX") {
      return leafsgoldenpromax;
    } else if (config.type === "LEAFSAUTUMN") {
      return leafsautumn;
    } else if (config.type === "LEAFSGREEN") {
      return leafsgreen;
    } else if (config.type === "FIRE") {
      return fire;
    } else if (config.type === "BLIZZARD") {
      return blizzard;
    } else if (config.type === "AURALINES") {
      return auralines;
    } else if (config.type === "SAND") {
      return sand;
    } else if (config.type === "CLOUD") {
      return cloud;
    } else if (config.type === "BLOOM") {
      return bloom;
    } else {
      return snow;
    }
  }

  private applyWeatherConfig(effect: Effect, config: WeatherConfig) {
    effect.uniforms = [
      { name: "direction", value: config.direction ?? { x: -1, y: -1 } },
      { name: "speed", value: config.speed ?? 1 },
      { name: "density", value: config.density ?? 3 },
    ];

    const sksl = this.getSkslFromConfig(config);
    if (effect.sksl !== sksl) {
      effect.sksl = sksl;
    }

    return effect;
  }

  private applyWeatherLayer(effect: Effect, parent: Item) {
    // If the parent is on the fog layer this effect should be put above it
    // If it is on the map layer put the effect at the bottom of the ruler layer
    const isFog = parent.layer === "FOG";
    const layer = isFog ? "FOG" : "RULER";
    const zIndex = isFog ? parent.zIndex + 1 : 0;
    if (effect.layer !== layer) {
      effect.layer = layer;
    }
    if (effect.zIndex !== zIndex) {
      effect.zIndex = zIndex;
    }
  }
}
