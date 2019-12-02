package characters.Astronauts;

import characters.IncomeTowers.IncomeTower;
import javafx.scene.image.Image;

public class MoneyBush extends IncomeTower {
	
	public MoneyBush() {
		super(HEALTH_MONEY_BUSH, ATTACK_SPEED_MONEY_BUSH, 
				DAMAGE_MONEY_BUSH, new Image(MONEY_BUSH_GIF, SPRITE_WIDTH, SPRITE_HEIGHT, false, false));
	}
	
	public int getCost() {
		return COST_MONEY_BUSH;
	}
	
	public int getTimeline() {
		return MONEY_BUSH_GEN_TIMELINE;
	}
	
	public int getDepositAmount() {
		return MONEY_BUSH_GEN_AMOUNT;
	}
	
	public String toString() {
		return "SpaceBucksPrinter\n" + super.infoCard();
	}
}