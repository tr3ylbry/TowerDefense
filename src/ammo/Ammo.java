/**
 * @author Adrian Bao
 * @author Trey Bryant
 * @author Mauricio Herrera
 * @author Tim Lukau
 * 
 * CSC 335 - Object Oriented Programming and Design
 * 
 * Title: Astronauts vs Aliens
 * 
 * File: Ammo.java
 * 
 * Description: This class describes the bullets that the defender towers will
 * shoot.
 */

package ammo;

import java.io.File;

import characters.Astronauts.DefenderTower;
import game.View;
import javafx.application.Platform;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
/**
 * Super class for all ammo
 * */
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;

/*
 * This class contains the necessary sound and image files to display the ammo of the defenders.
 * It also contains the methods that allow the ammo sprite/image to be moved across the board after
 * it is 'fired'. All of the specific/individual ammo classes inherit from this one.
 */
public class Ammo {
	
	//The basic stats of the ammo
	private int damage;
	private int speed;
	private Image sprite;
	private StackPane stackPane;
	private DefenderTower defender;
	private int col;
	private int row;
	
	//Image sizing
	protected static final int SPRITE_WIDTH = 35;
	protected static final int SPRITE_HEIGHT = 35;
	
	//AstroJoe Ammo Fields
	public static final String ASTROJOE_AMMO_SPRITE = "file:assets/ammo/astro-joe-ammo.png";
	
	
	//Explosive AstroJoe Ammo Fields
	public static final String EXPLOSIVE_ASTROJOE_AMMO_SPRITE = "file:assets/ammo/explosive-astro-joe-ammo.png";
	
	
	//MoonZeus Ammo Fields
	public static final String MOON_ZEUS_AMMO_SPRITE = "file:assets/ammo/moon-zeus-ammo.png";
	
	
	//Startrell Cluggins Ammo Fields
	public static final String STARTRELL_CLUGGINS_AMMO_SPRITE = "file:assets/ammo/startrell-cluggins-ammo.png";
	
	
	//TARS Ammo Fields
	public static final String TARS_AMMO_SPRITE = "file:assets/ammo/tars-ammo.png";
	
	// RailGun Ammo Image (same as MoonZeus)
	public static final String RAIL_GUN_AMMO_SPRITE = MOON_ZEUS_AMMO_SPRITE;
	

	
	// Constructor
	public Ammo (DefenderTower dt, Image sprite) {
		
		//Grabs the stats that are held in each unique DefenderTower object
		this.speed = dt.getAttackSpeed() * 10;
		this.damage = dt.getDamage();
		this.sprite = sprite;
		this.col = dt.getCol();
		this.row = dt.getRow();
		this.defender = dt;
		setStackPane();
	}
	/**
	 * This method initializes the stackpane that will contain the image of 
	 * the ammo.
	 */
	public void setStackPane() {
		stackPane = new StackPane();
		ImageView imageView = new ImageView(this.getImage());
		stackPane.getChildren().add(imageView);
	}
	
	/**
	 * Getter for damage attribute
	 * @return integer representing damage
	 */
	public int getDamage() {
		return damage;
	}
	
	/**
	 * This method is a getter for the stackPane attribute
	 * @return instance's stackpane
	 */
	public StackPane getStackPane() {
		return stackPane;
	}
	
	/**
	 * This method is a getter for the sprite attribute
	 * @return Image object
	 */
	public Image getImage() {
		return this.sprite;
	}
	
	/**
	 * This method is a setter for the column attribue
	 * @param col new column to be assigned
	 */
	public void setCol(int col) {
		this.col = col;
	}
	
	/**
	 * This method is a setter for the row attribute
	 * @param row new row to be assigned
	 */
	public void setRow(int row) {
		this.row = row;
	}
	
	/**
	 * This is a getter for the column attribute
	 * @return column attribute
	 */
	public int getCol() {
		return col;
	}
	
	/**
	 * This method is a getter for the row attribute
	 * @return integer representing row
	 */
	public int getRow() {
		return row;
	}
	
	/**
	 * This method increments the stackpane's translationX to move
	 * it horizontally accross the view.
	 */
	public void move() {
		double xPos = stackPane.getTranslateX();
		
		double movement = xPos + ((double)this.speed / 100.0);
		this.setCol(calculateCol(xPos));
		stackPane.setTranslateX(movement);
	}
	
	/**
	 * This method calculates the new column after a move.
	 * @param xPos x position of the stackpane
	 * @return integer representing column
	 */
	private int calculateCol(double xPos) {
		double x = xPos - View.COLUMN_OFFSET;
		return (int) x / View.GP_CELL_SIZE;
	}
	
	
	
}
